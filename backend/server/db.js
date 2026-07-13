import { MongoClient } from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

let db;

async function connectToDB() {
  try {
    const url = process.env.MONGO_URL;
    
    if (!url) {
      throw new Error("MONGO_URI is not defined in .env file");
    }

    const client = new MongoClient(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    await client.connect();
    db = client.db("narendra");
    console.log("Successfully connected to MongoDB");
    return db;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error; // Re-throw to handle in server.js
  }
}

export { connectToDB, db };