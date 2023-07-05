import connectDb from '@/utils/dbConnect';
import { NextApiRequest, NextApiResponse } from 'next';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import bcrypt from 'bcrypt';
import checkIfAuthenticated from '@/utils/checkIfAuthenticated';
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

  if (req.method !== 'POST' && req.method !== 'GET' && req.method !== 'PATCH') {
    res.status(400).json({ message: 'Invalid request method. Accepted: GET, POST, PATCH' });
    return;
  }

  if (req.method === 'GET') {
    const { email } = req.query;
    const authenticated = await checkIfAuthenticated(req, res);

    if (!authenticated) return;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    const database = client.db('saythanku');
    const usersCollection = database.collection('users');

    let user;
    try {
      user = await usersCollection.findOne({ email: email });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retreive a user from the database.' });
      client.close();
      return;
    }

    if (!user) {
      res.status(400).json({ message: 'No user found.' });
      client.close();
      return;
    }

    const userSelectedData = {
      name: user?.name,
      lastName: user?.lastName,
      profileImage: user?.profileImage,
    };
    res.status(200).json({ user: userSelectedData });
    client.close();
    return;
  }

  if (req.method === 'POST') {
    const { email, uniqueKey } = req.body;

    if (!email && !uniqueKey) {
      res.status(400).json({ message: 'Failed to authenticate the request. Invalid URL.' });
      return;
    }

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    //Locate such sign-up req. in the DB
    const database = client.db('saythanku');
    const signUpRequestsCollection = database.collection('sign-up-requests');
    let existingReq;

    try {
      existingReq = await signUpRequestsCollection.findOne({ email: email });
    } catch (err) {
      res.status(500).json({
        message: 'Failed to validate the request. Connection with the database failed.',
      });
      client.close();
      return;
    }

    //If request doesn't exist, throw err
    if (!existingReq) {
      res
        .status(400)
        .json({ message: 'Failed to activate non existing request. Please Sign up first!' });
      client.close();
      return;
    }

    //Check keys match
    const uniqueKeyMatches: boolean = await bcrypt.compare(uniqueKey, existingReq?.hashedUniqueKey);

    if (!uniqueKeyMatches) {
      res.status(400).json({ message: 'Request failed. Invalid activation key.' });
      client.close();
      return;
    }

    //If key matches, user is validated and let's create an account + delete obj from 'sign-up-requests' collection
    const usersCollection = database.collection('users');

    //Deleting unnecessary properties before inserting
    delete existingReq?.createdAt;
    delete existingReq?.hashedUniqueKey;

    try {
      await signUpRequestsCollection.deleteOne({ email: email });
      await usersCollection.insertOne({
        createdAt: new Date(),
        ...existingReq,
      });
      res.status(200).json({ message: 'Activation successfully completed! You can sign in now.' });
      client.close();
      return;
    } catch (err) {
      res.status(500).json({ message: 'Activation failed.' });
      client.close();
      return;
    }
  }

  if (req.method === 'PATCH') {
    const { userId, key } = req.body;

    let client;

    try {
      client = await connectDb();
    } catch (err) {
      res.status(500).json({ message: 'Failed to connect to the database.' });
      return;
    }

    //Check if the request exists based on userId
    const database = client.db('saythanku');
    const credentialsChangeCollection = database.collection('credentials-change-requests');

    let existingReq;
    try {
      existingReq = await credentialsChangeCollection.findOne({ userId: userId });

      if (!existingReq) {
        res.status(400).json({
          message: 'Request does not exist in the database - has expired or has not been created.',
        });
        client.close();
        return;
      }
    } catch (err) {
      res.status(500).json({ message: 'Failed to validate the request' });
      client.close();
      return;
    }

    //Check if the key matches
    const uniqueKeyMatches: boolean = await bcrypt.compare(key, existingReq?.hashedUniqueKey);

    if (!uniqueKeyMatches) {
      res.status(400).json({ message: 'Request failed. Invalid key.' });
      client.close();
      return;
    }

    // Get old user data
    const usersCollection = database.collection('users');

    let oldUserData;
    try {
      oldUserData = await usersCollection.findOne({ _id: new ObjectId(userId) });
    } catch (err) {
      res.status(500).json({ message: 'Failed to retreive current user data' });
      client.close();
      return;
    }

    //Update the user document with the new data
    const dataToInsert = {
      name: existingReq.name,
      lastName: existingReq.lastName,
      email: existingReq.email,
      password: existingReq.password,
      profileImage: existingReq.profileImage,
    };

    try {
      await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: dataToInsert,
        }
      );
    } catch (err) {
      res.status(500).json({ message: 'Failed to update the user data in the database.' });
      client.close();
      return;
    }

    //Get documents from cards collection => update all sender... props in all docs.
    const cardsCollection = database.collection('cards');

    try {
      const dataToInsert = {
        senderName: existingReq.name,
        senderLastName: existingReq.lastName,
        senderEmail: existingReq.email,
        senderPicture: existingReq.profileImage,
        lastModified: new Date(),
      };

      await cardsCollection.updateMany(
        { senderId: userId },
        {
          $set: dataToInsert,
        }
      );
    } catch (err) {
      res.status(500).json({ message: 'Failed to update the documents in the database.' });
      client.close();
      return;
    }
    //Update recipientEmail in all docs.
    try {
      await cardsCollection.updateMany(
        { recipientEmail: oldUserData?.email },
        {
          $set: { recipientEmail: existingReq.email },
        }
      );
    } catch (err) {
      res.status(500).json({ message: 'Failed to update the documents in the database.' });
      client.close();
      return;
    }

    //Remove document from Credentials Change Requests collection
    try {
      await credentialsChangeCollection.deleteOne({ userId: userId });
    } catch (err) {
      res.status(500).json({ message: 'Failed to remove the document from the database.' });
      client.close();
      return;
    }

    res.status(200).json({
      message: 'The data has been successfully changed. Please sign in with your credentials.',
    });
    client.close();
    return;
  }
};

export default handler;
