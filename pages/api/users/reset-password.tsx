import connectDb from '@/utils/dbConnect';
import { NextApiRequest, NextApiResponse } from 'next';
import generator from 'generate-password';
import bcrypt from 'bcrypt';
import RecoveryEmail from '@/react-email-starter/emails/RecoveryEmail';
import NodeMailerConfig from '../../../config/nodemailer';
import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import { ObjectId } from 'mongodb';

const rateLimiter = {};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: 'OK',
    });
  }

  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted: POST, PATCH' });
    return;
  }

  if (req.method === 'POST') {
    const { email } = req.body;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    const database = client.db('saythanku');

    //Check if such account exists in 'users' collection
    //If acc doesn't exist, throw err
    const usersCollection = database.collection('users');

    let existingUser;

    try {
      existingUser = await usersCollection.findOne({ email: email });

      if (!existingUser) {
        res
          .status(400)
          .json({ message: 'There is no account registered with this email address.' });
        client.close();
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to check if such user exists.' });
      client.close();
      return;
    }

    //Check if recovery request has already been created, if yes, delete old one before new gets created

    const recoveryRequestsCollection = database.collection('recovery-requests');

    try {
      const existingReq = await recoveryRequestsCollection.findOne({ email: email });

      if (existingReq) {
        await recoveryRequestsCollection.deleteOne({ email: email });
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to validate the request' });
      client.close();
      return;
    }

    //Generate uniqueKey
    const saltRounds = 10;
    const uniqueKey = generator.generate({ length: 25, numbers: true, uppercase: false });
    const hashedUniqueKey = await bcrypt.hash(uniqueKey, saltRounds);

    //Create a request in DB (email, uniqueKey);
    //I am setting TTL - created document will expire (gets removed) after 1 hour
    try {
      await recoveryRequestsCollection.createIndex({ createdAt: 1 }, { expireAfterSeconds: 3600 });
      await recoveryRequestsCollection.insertOne({
        createdAt: new Date(),
        email,
        userId: existingUser._id.toString(),
        uniqueKey: hashedUniqueKey,
      });
    } catch (err) {
      res.status(500).json({ message: 'Failed to create an account recovery request.' });
      client.close();
      return;
    }

    //Send email with reset link
    let transporter = nodemailer.createTransport(NodeMailerConfig);

    const url = `${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/reset-password/${existingUser._id}/${uniqueKey}`;

    const emailHtml = render(<RecoveryEmail url={url} />);

    const options = {
      from: process.env.GMAIL_USERNAME,
      to: email,
      subject: `Account Recovery - saythanku app`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(options);
    } catch (err) {
      res.status(500).json({ message: 'Failed to send the email with a reset link.' });
      client.close();
      return;
    }

    res.status(200).json({
      message: `The email with the reset link has been sent to ${email}. The reset link is valid for 1 hour. Check the SPAM folder if you have trouble finding it.`,
    });
    client.close();
    return;
  }

  if (req.method === 'PATCH') {
    const { userId, uniqueKey, password, confirmPassword } = req.body;

    //Compare if passwords match
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Request failed. Password does not match.' });
      return;
    }

    let client;
    try {
      client = await connectDb();
    } catch (error) {
      res.status(500).json({ message: 'Connecting to the database failed.' });
      return;
    }

    const database = client.db('saythanku');
    const recoveryRequestsCollection = database.collection('recovery-requests');

    //Validate if request exists/is still valid in recovery-requests collection

    let recoveryRequest;

    try {
      recoveryRequest = await recoveryRequestsCollection.findOne({ userId: userId });

      if (!recoveryRequest) {
        res.status(401).json({
          message:
            'Request failed. The Link could expire or the request for a password change has not been made.',
        });
        client.close();
        return;
      }
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Problem with the request validation.' });
      client.close();
      return;
    }

    //Validate if uniqueKey matches (key in url === key in DB)
    let match;

    try {
      match = await bcrypt.compare(uniqueKey, recoveryRequest.uniqueKey);
    } catch (error) {
      res.status(500).json({ message: 'Request failed. Unable to validate the access key.' });
      client.close();
      return;
    }

    if (!match) {
      res.status(401).json({
        message: `Request failed. No permission to change the password for the account: ${recoveryRequest.userEmail}`,
      });
      client.close();
      return;
    }

    //Now insert changed password to the database
    const usersCollection = database.collection('users');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    //Remove recovery request from the database
    try {
      await recoveryRequestsCollection.deleteOne({ userId: userId });
    } catch (error) {
      res.status(500).json({
        message: 'Could not remove the recovery object from the database.',
      });
      client.close();
      return;
    }

    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: { password: hashedPassword }, $currentDate: { lastModified: true } }
      );
    } catch (error) {
      res
        .status(500)
        .json({ message: 'Request failed. Unable to insert new password to the database.' });
      client.close();
      return;
    }

    res.status(200).json({
      message:
        'Password has been successfully changed. You can sign in now with your new credentials.',
    });
    client.close();
    return;
  }
};

export default handler;
