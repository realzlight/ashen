import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import ghRoutes from './routes/gh.js'; // or ./routes/auth.js - whatever you named it
import mongoose from 'mongoose';
import projectRoutes from './routes/project.js'
dotenv.config();
const app = express();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

connectDB();

app.use(cors({ 
  origin: process.env.CLIENT_URL || 'http://localhost:5173', 
  credentials: true 
}));
app.use(express.json());
app.use(cookieParser());

// ROUTES
app.use('/api/auth', ghRoutes);
app.use('/api/projects', projectRoutes)
app.get('/', (req, res) => {
  res.json({ status: 'ashen running' });
});


// LISTENING
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Ashen on ${PORT}`));
