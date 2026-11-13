import './env.js';
import { config } from '../src/config/index.js';
import mongoose from 'mongoose';
import UserModel from '../src/models/user.model.js';
import StoreModel from '../src/models/store.model.js';
import OrderModel from '../src/models/order.model.js';
import fs from 'node:fs/promises';

function testDatabase() {
  if (config.nodeEnv !== 'test' || mongoose.connection.name !== 'shipnow-903050_test') {
    throw new Error('Limpieza bloqueada: se requiere la base shipnow-903050_test');
  }
}

async function clean() {
  testDatabase();

  await OrderModel.deleteMany({});
  await StoreModel.deleteMany({});
  await UserModel.deleteMany({});
}

export const mochaHooks = {
  async beforeAll() {
    if (!config.mongoDbUri) {
      throw new Error('Falta MONGODB_URI_TEST en .env');
    }

    await mongoose.connect(config.mongoDbUri, {
      serverSelectionTimeoutMS: 5000,
    });

    testDatabase();
    await UserModel.init();
  },

  async beforeEach() {
    await clean();
    await fs.rm('uploads/test/documents', {
      recursive: true,
      force: true,
    });
    await fs.mkdir('uploads/test/documents', { recursive: true });
  },

  async afterAll() {
    try {
      if (mongoose.connection.readyState === 1) {
        await clean();
      }
    } finally {
      await mongoose.disconnect();
    }
  },
};
