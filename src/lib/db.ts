
import mongoose from 'mongoose';
import { getEnv } from './env';

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection:
    | {
        promise: Promise<typeof mongoose> | null;
        client: typeof mongoose | null;
      }
    | undefined;
}

const cached = (globalThis.mongooseConnection ??= {
  promise: null,
  client: null,
});

export async function connectToDatabase() {
 

  const uri = getEnv().MONGODB_URI;

  if (!uri) {
    console.log('MONGODB_URI is missing');
    return null;
  }



  if (cached.client) {
    console.log('Using cached connection');
    return cached.client;
  }

  cached.promise ??= mongoose.connect(uri, {
    dbName: 'crm',
    bufferCommands: false,
  });

  cached.client = await cached.promise;

  return cached.client;
}

export function isMongoReady() {
  return Boolean(getEnv().MONGODB_URI);
}
