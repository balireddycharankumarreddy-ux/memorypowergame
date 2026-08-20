const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory scores fallback (used when MongoDB is not available)
let useInMemory = false;
let inMemoryScores = [];

// Try to connect to MongoDB
let Score = null;

async function initDB() {
  try {
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/memory-card-game';

    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ MongoDB connected successfully');

    // Score Schema
    const scoreSchema = new mongoose.Schema({
      playerName: { type: String, required: true, trim: true },
      moves: { type: Number, required: true },
      time: { type: Number, required: true },
      pairsFound: { type: Number, required: true },
      difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
      createdAt: { type: Date, default: Date.now }
    });

    Score = mongoose.model('Score', scoreSchema);
  } catch (err) {
    console.log('⚠️  MongoDB not available — using in-memory storage');
    console.log('   (Leaderboard will still work, but scores reset on server restart)');
    useInMemory = true;
  }
}

// Routes

// Get top scores
app.get('/api/scores', async (req, res) => {
  try {
    const { difficulty, limit = 10 } = req.query;

    if (useInMemory) {
      let filtered = difficulty
        ? inMemoryScores.filter(s => s.difficulty === difficulty)
        : inMemoryScores;
      filtered = filtered.sort((a, b) => a.moves - b.moves || a.time - b.time).slice(0, parseInt(limit));
      return res.json(filtered);
    }

    const query = difficulty ? { difficulty } : {};
    const scores = await Score.find(query).sort({ moves: 1, time: 1 }).limit(parseInt(limit));
    res.json(scores);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch scores' });
  }
});

// Save a new score
app.post('/api/scores', async (req, res) => {
  try {
    const { playerName, moves, time, pairsFound, difficulty } = req.body;

    if (useInMemory) {
      const score = {
        _id: Date.now().toString(),
        playerName, moves, time, pairsFound, difficulty,
        createdAt: new Date().toISOString()
      };
      inMemoryScores.push(score);
      return res.status(201).json(score);
    }

    const score = new Score({ playerName, moves, time, pairsFound, difficulty });
    await score.save();
    res.status(201).json(score);
  } catch (err) {
    res.status(400).json({ error: 'Failed to save score' });
  }
});

// Get score by ID
app.get('/api/scores/:id', async (req, res) => {
  try {
    if (useInMemory) {
      const score = inMemoryScores.find(s => s._id === req.params.id);
      if (!score) return res.status(404).json({ error: 'Score not found' });
      return res.json(score);
    }

    const score = await Score.findById(req.params.id);
    if (!score) return res.status(404).json({ error: 'Score not found' });
    res.json(score);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch score' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    storage: useInMemory ? 'in-memory' : 'mongodb',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, async () => {
  await initDB();
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`   Storage: ${useInMemory ? 'In-Memory' : 'MongoDB'}`);
});
