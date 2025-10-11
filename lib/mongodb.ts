import { MongoClient } from "mongodb";

const uri = process.env.MONGO_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!uri) {
  throw new Error("Please define the MONGO_URI environment variable inside .env");
}

// In development, use a global variable so the connection is cached
if (process.env.NODE_ENV === "development") {
  if (!(global as any)._mongoClientPromise) {
    client = new MongoClient(uri, options);
    (global as any)._mongoClientPromise = client.connect();
  }
  clientPromise = (global as any)._mongoClientPromise;
} else {
  // In production, create a new client each time
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export async function getDB() {
  const connectedClient = await clientPromise;
  return connectedClient.db("fittrackerDB");
}
