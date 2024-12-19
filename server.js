const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/pingpong', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const gameSchema = new mongoose.Schema({
  playerScore: Number,
  aiScore: Number,
  timestamp: { type: Date, default: Date.now },
  duration: Number
});

const Game = mongoose.model('Game', gameSchema);

app.post('/api/games', async (req, res) => {
  try {
    const game = new Game(req.body);
    await game.save();
    res.status(201).json(game);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/stats', async (req, res) => {
  try {
    const stats = await Game.aggregate([
      {
        $group: {
          _id: null,
          totalGames: { $sum: 1 },
          avgPlayerScore: { $avg: '$playerScore' },
          avgAiScore: { $avg: '$aiScore' }
        }
      }
    ]);
    res.json(stats[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});