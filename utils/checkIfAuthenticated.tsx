import { getToken } from 'next-auth/jwt';
import { NextApiResponse, NextApiRequest } from 'next';

const checkIfAuthenticated = async (req: NextApiRequest, res: NextApiResponse) => {
  const token = await getToken({ req });

  if (!token) {
    res.status(401).json({ message: 'Protected resource, no access granted.' });
    return false;
  }

  return token;
};

export default checkIfAuthenticated;
