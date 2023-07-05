import { MongoClient } from 'mongodb';

const connectDb = async (): Promise<MongoClient> => {
  const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.CLUSTER_NAME}.zmbr92e.mongodb.net/?retryWrites=true&w=majority`;

  const client = await MongoClient.connect(uri);

  return client;
};

export default connectDb;
