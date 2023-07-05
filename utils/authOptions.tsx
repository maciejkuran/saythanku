import { NextAuthOptions } from 'next-auth';

import CredentialsProvider from 'next-auth/providers/credentials';
import connectDb from '@/utils/dbConnect';
import bcrypt from 'bcrypt';
import { checker } from '@/rateLimitedMiddleware';
const get_ip = require('ipware')().get_ip;
import { NextApiRequest } from 'next';

const rateLimiter = {};

interface Credentials {
  email: string;
  password: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      async authorize(credentials: Credentials, req: NextApiRequest) {
        const { email, password } = credentials;
        //I used the library to retreive user ip as req object for some reason doesn't contain any properties from which I can retreive ip.
        const ip = get_ip(req).clientIp;
        const rateLimitOk = checker(ip, rateLimiter);

        if (!rateLimitOk) {
          throw new Error('Blocked. Too Many Requests. Make another request after 1 minute.');
        }

        if (email === '' || !email.includes('.') || !email.includes('@')) {
          throw new Error('Invalid email address.');
        }

        if (!password) {
          throw new Error('Empty password input.');
        }

        let client;
        try {
          client = await connectDb();
        } catch (error) {
          throw new Error('Connecting to the database failed.');
        }

        const database = client.db('saythanku');
        const users = database.collection('users');

        const user = await users.findOne({ email: email });

        if (!user) {
          client.close();
          throw new Error('No user found');
        }

        //Validate if hashed password matches input password
        const hashedPassword = user.password; //hashed password
        const match = await bcrypt.compare(password, hashedPassword);

        if (!match) {
          client.close();
          throw new Error('Invalid user password.');
        }
        client.close();
        return user as {};
      },
    } as any),
  ],
  //Callback cycle: authorize --> jwt --> session
  //jwt callback(cb) accepts the user object that authorize cb returns. By default jwt retuns the token and things return from there is then available in the token object of session cb.
  callbacks: {
    async jwt({ token, user }) {
      return { ...token, ...user };
    },

    async session({ session, token, user }) {
      delete token.password;

      return { ...session, user: token };
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
