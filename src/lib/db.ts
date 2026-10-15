import mongoose from 'mongoose';
import { getEnv, hasMongoConnection } from './env';

declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: {
    promise: Promise<typeof mongoose> | null;
    client: typeof mongoose | null;
  } | undefined;
}

const cached = globalThis.mongooseConnection ?? {
  promise: null,
  client: null
};

globalThis.mongooseConnection = cached;

export async function connectToDatabase() {
  if (!hasMongoConnection()) {
    return null;
  }

  if (cached.client) {
    return cached.client;
  }

  cached.promise ??= mongoose.connect(getEnv().MONGODB_URI as string, {
    dbName: 'crm',
    bufferCommands: false
  });

  cached.client = await cached.promise;
  return cached.client;
}

export function isMongoReady() {
  return hasMongoConnection();
}