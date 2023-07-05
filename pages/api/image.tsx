import { getDownloadURL, getStorage, ref, uploadString } from 'firebase/storage';
import app from '@/config/firebase';
import rateLimiterMiddleware from '@/rateLimitedMiddleware';
import { NextApiRequest, NextApiResponse } from 'next';

const rateLimiter = {};

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  //Check rate limit
  const rateLimitOk = rateLimiterMiddleware(req, res, rateLimiter);

  if (!rateLimitOk) return;

  if (req.method !== 'POST') {
    res.status(400).json({ message: 'Invalid request method. Accepted method: POST' });
    return;
  }

  if (req.method === 'POST') {
    const { image, imageName, imageSize } = req.body;

    if (imageSize > 1024) {
      res.status(400).json({ message: `Submission failed. Image exceeds 1MB.` });
      return;
    }

    const storage = getStorage(app);
    const storageRef = ref(storage, imageName);

    let url;
    try {
      const snapshot = await uploadString(storageRef, image, 'base64', {
        contentType: 'image/png',
      });

      url = await getDownloadURL(snapshot.ref);

      res.status(200).json({
        location: url,
      });
    } catch (err) {
      res.status(500).json({ message: 'Inserting image failed.' });
      return;
    }
  }
};

export default handler;

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
