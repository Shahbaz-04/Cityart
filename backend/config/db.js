// config/db.js
const mongoose = require('mongoose');

// Try to use a real MongoDB if MONGO_URI is provided. Otherwise spin up
// an in-memory MongoDB (mongodb-memory-server) for local development.
const connectDB = async () => {
  const tryConnect = async (uri) => {
    return mongoose.connect(uri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    });
  };

  try {
    const envUri = process.env.MONGO_URI;

    if (envUri) {
      try {
        const conn = await tryConnect(envUri);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        console.warn('Failed to connect to MONGO_URI, will try an in-memory MongoDB.');
        console.warn(err.message);
      }
    }

    // Start in-memory MongoDB as a fallback
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const mongoUri = mongod.getUri();
    // keep reference so it's not garbage-collected
    global.__MONGOD__ = mongod;
    console.log('Using in-memory MongoDB');

    const conn = await tryConnect(mongoUri);
    console.log(`MongoDB Connected (in-memory): ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;

module.exports = connectDB;