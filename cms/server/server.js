import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.routes.js';
import sitesRoutes from './routes/sites.routes.js';
import pagesRoutes from './routes/pages.routes.js';
import postsRoutes from './routes/posts.routes.js';
import mediaRoutes from './routes/media.routes.js';
import publicRoutes from './routes/public.routes.js';
import templatesRoutes from './routes/templates.routes.js';
import userRoutes from './routes/users.routes.js';

dotenv.config();

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

app.use('/api/auth', authRoutes);
app.use('/api/sites', sitesRoutes);
app.use('/api/pages', pagesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/users', userRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
