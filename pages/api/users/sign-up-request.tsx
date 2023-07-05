import connectDb from '@/utils/dbConnect';
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import bcrypt from 'bcrypt';
import generator from 'generate-password';
import NodeMailerConfig from '../../../config/nodemailer';
import nodemailer from 'nodemailer';
import SignUpEmail from '@/react-email-starter/emails/SignUpEmail';
import { render } from '@react-email/render';

const rateLimiter = {};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //Preventing CORS issues.If you try to send a POST, DELETE, PUT, etc.. request , the preflight will send it’s ‘first army’ to check the ‘battle field’. But this army is not the request itself, but an OPTION request. That’s why in our API we need to handle OPTION request.
  if (req.method === 'OPTIONS') {
    return res.status(200).json({
      body: 'OK',
    });
  }

  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted: POST' });
    return;
  }

  if (req.method === 'POST') {
    const { name, lastName, email, password, confirmPassword } = req.body;

    //Validate if inputs aren't empty
    if (!name || !lastName || !email || !password || !confirmPassword) {
      res
        .status(400)
        .json({ message: 'Required inputs: name, last name, email, password, confirm password.' });
      return;
    }

    //Validate email address
    if (!email.includes('@') || !email.includes('.')) {
      res.status(400).json({ message: 'Invalid email address.' });
      return;
    }

    //Validate if password matches
    if (password !== confirmPassword) {
      res.status(400).json({ message: 'Password does not match.' });
      return;
    }

    //Validate password length
    if (password.length < 8 && password.length > 25) {
      res.status(400).json({ message: 'Password must contain between 8-25 characters.' });
      return;
    }

    //Hashing password
    let hashedPassword: string;
    const saltRounds = 10;
    try {
      hashedPassword = await bcrypt.hash(password, saltRounds);
    } catch {
      res.status(500).json({ message: 'Password processing has failed.' });
      return;
    }

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    //Generate unique key
    const uniqueKey = generator.generate({ length: 25, numbers: true, uppercase: false });
    const hashedUniqueKey = await bcrypt.hash(uniqueKey, saltRounds);
    //Store user data object with unique key in 'sign-up-requests' collection in the database.
    const database = client.db('saythanku');
    const signUpRequestsCollection = database.collection('sign-up-requests');

    delete req.body.confirmPassword;

    //FIRST CHECK! If there's no account registered under this email.
    const usersCollection = database.collection('users');
    try {
      const existingAccount = await usersCollection.findOne({ email: email });

      if (existingAccount) {
        res.status(400).json({ message: 'The account for this email address already exists.' });
        client.close();
        return;
      }
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Request failed. Unable to validate provided email address.' });
      client.close();
      return;
    }

    //CHECK ... if there are already opened sign up requests in the DB. If yes, delete the existing one because there will be another created.
    try {
      const existingDocument = await signUpRequestsCollection.findOne({ email: email });

      if (existingDocument) {
        await signUpRequestsCollection.deleteOne({ email: email });
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      client.close();
      return;
    }

    try {
      //Inserting document to database
      await signUpRequestsCollection.insertOne({
        createdAt: new Date(),
        hashedUniqueKey,
        ...req.body,
        password: hashedPassword,
      });
    } catch (err) {
      res.status(500).json({ message: 'Sign up request has failed.' });
      client.close();
      return;
    }

    //Send email to user with activation account button
    //(activation link: /activation/emailAddress/uniqueKey)

    let transporter = nodemailer.createTransport(NodeMailerConfig);

    const url = `${process.env.NEXT_PUBLIC_VERCEL_URL}/auth/activation/${email}/${uniqueKey}`;

    const emailHtml = render(<SignUpEmail signUp={true} url={url} name={name} />);

    const options = {
      from: process.env.GMAIL_USERNAME,
      to: email,
      subject: `Account Activation - saythanku app`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(options);
    } catch (err) {
      res.status(500).json({ message: 'We were unable to send an activation email.' });
      client.close();
      return;
    }

    res.status(200).json({
      message: `The email with the activation link has been sent to ${email}. Check the SPAM folder if you have trouble finding it.`,
    });
    client.close();
    return;
  }
};

export default handler;
