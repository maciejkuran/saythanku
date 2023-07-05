import connectDb from '@/utils/dbConnect';
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
import NodeMailerConfig from '../../../config/nodemailer';
import nodemailer from 'nodemailer';
import CardEmail from '@/react-email-starter/emails/CardEmail';
import { render } from '@react-email/render';
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

  //Check if authenticated (if token exists);
  const authenticated = await checkIfAuthenticated(req, res);

  if (!authenticated) return;

  if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted: GET, POST, PATCH' });
    return;
  }

  if (req.method === 'GET') {
    const { email: tokenEmail } = authenticated;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    const database = client.db('saythanku');
    const cardsCollection = database.collection('cards');

    //Get all received cards
    let receivedCards;
    try {
      receivedCards = await cardsCollection
        .find({ recipientEmail: tokenEmail })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (err) {
      res.status(500).json({ message: 'Failed to retreive the received cards from the database.' });
      client.close();
      return;
    }

    //Get submitted cards
    let submittedCards;
    try {
      submittedCards = await cardsCollection
        .find({ senderEmail: tokenEmail })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (err) {
      res
        .status(500)
        .json({ message: 'Failed to retreive the submitted cards from the database.' });
      client.close();
      return;
    }

    res.status(200).json({
      totalReceivedCards: receivedCards.length,
      receivedCards,
      totalSubmittedCards: submittedCards.length,
      submittedCards,
    });
    client.close();
    return;
  }

  if (req.method === 'POST') {
    const {
      recipientEmail,
      cardTitle,
      cardContent,
      gift,
      wordsCount,
      senderName,
      senderLastName,
      senderPicture,
    } = req.body;

    //Validate if input fields are not empty
    if (!recipientEmail || !cardTitle || !cardContent || !gift) {
      res.status(400).json({ message: 'All fields are required.' });
      return;
    }

    //Validate email addresss
    if (!recipientEmail.includes('@') || !recipientEmail.includes('.')) {
      res.status(400).json({ message: 'Incorrect email address.' });
      return;
    }

    //Validate wordsCount
    if (wordsCount > 100) {
      res.status(400).json({ message: 'You have exceeded the allowed number of 100 words.' });
      return;
    }

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    const database = client.db('saythanku');
    const cardsCollection = database.collection('cards');

    //Insert card to the database
    delete req.body.wordsCount; //deleting unnecessary property that was only used for validation

    try {
      await cardsCollection.insertOne({ ...req.body, createdAt: new Date() });
    } catch (err) {
      res.status(500).json({ message: 'Failed to insert the data to the database.' });
      client.close();
      return;
    }

    //Send email to recipient
    let transporter = nodemailer.createTransport(NodeMailerConfig);

    const props = { senderName, senderLastName, senderPicture, cardTitle, cardContent, gift };

    const emailHtml = render(<CardEmail {...props} />);

    const options = {
      from: process.env.GMAIL_USERNAME,
      to: recipientEmail,
      subject: `${senderName} ${senderLastName} is sending a Thank You Card!`,
      html: emailHtml,
    };

    try {
      await transporter.sendMail(options);
    } catch (err) {
      res.status(500).json({ message: 'We were unable to send an activation email.' });
      client.close();
      return;
    }

    res
      .status(200)
      .json({ message: `Congrats! The card has been successfully sent to ${recipientEmail}.` });
    client.close();
    return;
  }

  if (req.method === 'PATCH') {
    const { cardId } = req.body;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    const database = client.db('saythanku');
    const cardsCollection = database.collection('cards');

    try {
      await cardsCollection.updateOne(
        { _id: new ObjectId(cardId) },
        {
          $set: { read: true },
          $currentDate: { lastModified: true },
        }
      );
      res.status(200).json({ message: 'The read property status has been updated.' });
      client.close();
      return;
    } catch (err) {
      res.status(500).json({ message: 'Failed to update the read property status.' });
      client.close();
      return;
    }
  }
};

export default handler;
