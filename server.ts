import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || 'polymath-secret-key';
const PORT = 3000;

async function initDB() {
  const db = await open({
    filename: './database.sqlite',
    driver: sqlite3.Database
  });

  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      displayName TEXT,
      email TEXT UNIQUE,
      password TEXT,
      photoURL TEXT,
      role TEXT DEFAULT 'user',
      level INTEGER DEFAULT 1,
      xp INTEGER DEFAULT 0,
      quizzesCompleted INTEGER DEFAULT 0,
      avgScore REAL DEFAULT 0,
      globalRank INTEGER DEFAULT 0,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT,
      description TEXT,
      category TEXT,
      difficulty TEXT,
      timeLimit INTEGER,
      questionCount INTEGER,
      imageUrl TEXT,
      createdBy TEXT,
      createdAt TEXT
    );

    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quizId TEXT,
      text TEXT,
      options TEXT, -- JSON string
      correctAnswerIndex INTEGER,
      explanation TEXT,
      FOREIGN KEY(quizId) REFERENCES quizzes(id)
    );

    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      userId TEXT,
      quizId TEXT,
      quizTitle TEXT,
      score REAL,
      totalQuestions INTEGER,
      correctAnswers INTEGER,
      timeSpent INTEGER,
      completedAt TEXT,
      FOREIGN KEY(userId) REFERENCES users(id),
      FOREIGN KEY(quizId) REFERENCES quizzes(id)
    );
  `);

  return db;
}

async function startServer() {
  const db = await initDB();
  const app = express();

  app.use(express.json());
  app.use(cookieParser());
  app.use(cors());

  // Auth Middleware
  const authenticate = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Unauthorized' });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      res.status(401).json({ error: 'Invalid token' });
    }
  };

  const isAdmin = (req: any, res: any, next: any) => {
    if (req.user?.role === 'admin' || req.user?.email === 'govindkethawath004@gmail.com') {
      next();
    } else {
      res.status(403).json({ error: 'Forbidden' });
    }
  };

  // Auth Routes
  app.post('/api/auth/register', async (req, res) => {
    const { email, password, displayName } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substring(2, 15);
    try {
      await db.run(
        'INSERT INTO users (id, email, password, displayName, createdAt) VALUES (?, ?, ?, ?, ?)',
        [id, email, hashedPassword, displayName, new Date().toISOString()]
      );
      res.json({ success: true });
    } catch (err) {
      res.status(400).json({ error: 'User already exists' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await db.get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
    res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'none' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
  });

  app.get('/api/auth/me', authenticate, async (req: any, res) => {
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password: _, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // Quiz Routes
  app.get('/api/quizzes', authenticate, async (req, res) => {
    const quizzes = await db.all('SELECT * FROM quizzes ORDER BY createdAt DESC');
    res.json(quizzes);
  });

  app.get('/api/quizzes/:id', authenticate, async (req, res) => {
    const quiz = await db.get('SELECT * FROM quizzes WHERE id = ?', [req.params.id]);
    if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
    const questions = await db.all('SELECT * FROM questions WHERE quizId = ?', [req.params.id]);
    res.json({ ...quiz, questions: questions.map(q => ({ ...q, options: JSON.parse(q.options) })) });
  });

  app.post('/api/quizzes', authenticate, isAdmin, async (req: any, res) => {
    const { title, description, category, difficulty, timeLimit, questions, imageUrl } = req.body;
    const quizId = Math.random().toString(36).substring(2, 15);
    await db.run(
      'INSERT INTO quizzes (id, title, description, category, difficulty, timeLimit, questionCount, imageUrl, createdBy, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [quizId, title, description, category, difficulty, timeLimit, questions.length, imageUrl, req.user.id, new Date().toISOString()]
    );
    for (const q of questions) {
      const qId = Math.random().toString(36).substring(2, 15);
      await db.run(
        'INSERT INTO questions (id, quizId, text, options, correctAnswerIndex, explanation) VALUES (?, ?, ?, ?, ?, ?)',
        [qId, quizId, q.text, JSON.stringify(q.options), q.correctAnswerIndex, q.explanation]
      );
    }
    res.json({ id: quizId });
  });

  app.delete('/api/quizzes/:id', authenticate, isAdmin, async (req, res) => {
    try {
      await db.run('DELETE FROM questions WHERE quizId = ?', [req.params.id]);
      await db.run('DELETE FROM quizzes WHERE id = ?', [req.params.id]);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete quiz' });
    }
  });

  // Attempt Routes
  app.post('/api/attempts', authenticate, async (req: any, res) => {
    const { quizId, quizTitle, score, totalQuestions, correctAnswers, timeSpent } = req.body;
    const id = Math.random().toString(36).substring(2, 15);
    await db.run(
      'INSERT INTO attempts (id, userId, quizId, quizTitle, score, totalQuestions, correctAnswers, timeSpent, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [id, req.user.id, quizId, quizTitle, score, totalQuestions, correctAnswers, timeSpent, new Date().toISOString()]
    );
    // Update user stats
    const user = await db.get('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const newQuizzesCompleted = user.quizzesCompleted + 1;
    const newAvgScore = ((user.avgScore * user.quizzesCompleted) + score) / newQuizzesCompleted;
    await db.run(
      'UPDATE users SET quizzesCompleted = ?, avgScore = ?, xp = xp + ? WHERE id = ?',
      [newQuizzesCompleted, newAvgScore, score * 10, req.user.id]
    );
    res.json({ id });
  });

  app.get('/api/attempts/me', authenticate, async (req: any, res) => {
    const attempts = await db.all('SELECT * FROM attempts WHERE userId = ? ORDER BY completedAt DESC', [req.user.id]);
    res.json(attempts);
  });

  app.get('/api/attempts/:id', authenticate, async (req: any, res) => {
    const attempt = await db.get('SELECT * FROM attempts WHERE id = ?', [req.params.id]);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    if (attempt.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden' });
    }
    res.json(attempt);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
