import { MongoClient } from 'mongodb';

let cached:any = {}
const uri = process.env.MONGODB_URI || "mongodb+srv://sayanpaul988_db_user:8L5J3Y6mBmql6Xz3@cluster0.1otr5ym.mongodb.net/smart_home?retryWrites=true&w=majority&appName=Cluster0";
const dbName = process.env.MONGODB_DB || "smart_home";

export async function connect(){
  if(cached.db) return { client: cached.client, db: cached.db }
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db(dbName);
  cached.client = client; cached.db = db;
  return { client, db };
}
