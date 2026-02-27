import mongoose from "mongoose";

let cached = null;

export default async function connectDB() {
  if (cached) return cached;

  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`MongoDB conectado: ${conn.connection.host}`);
  cached = conn;
  return conn;
}
