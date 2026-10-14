import mongoose from 'mongoose';
import { config } from './index.js';

const connectDB = async () => {
  const mongoUri = config.mongoDbUri;

  if (!mongoUri) {
    throw new Error('Falta la variable MONGODB_URI');
  }

  await mongoose.connect(mongoUri);
  console.log('MongoDB conectado');
};

export default connectDB;
