import connectDb from '../db/db.js';
import dotenv from 'dotenv';
import { app } from '../app.js';

dotenv.config({ path: '.env' });

let isConnected = false;

export default async function handler(req, res) {
    if (!isConnected) {
        await connectDb();
        isConnected = true;
    }
    app(req, res); // Let Express handle the request
}
