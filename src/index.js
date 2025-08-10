import connectDb from '../db/db.js';
import { app } from '../app.js';

let isConnected = false;

export default async function handler(req, res) {
  if (!isConnected) {
    await connectDb();
    isConnected = true;
  }
  app(req, res); // Let Express handle the request
}
