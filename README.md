# 🧠 Memory Card Game

A full-stack MERN (MongoDB, Express, React, Node.js) memory card game with multiple game modes, sound effects, confetti animations, and a leaderboard system.

![Memory Card Game](https://img.shields.io/badge/React-18-blue) ![Node.js](https://img.shields.io/badge/Node.js-20-green) ![MongoDB](https://img.shields.io/badge/MongoDB-7-brightgreen) ![Express](https://img.shields.io/badge/Express-4-orange)

## 🎮 Features

### Game Modes
- **⏱️ Classic Mode**: Play at your own pace - complete all pairs with no time limit
- **⚡ Countdown Mode**: Race against the clock with time limits:
  - Easy: 60 seconds
  - Medium: 120 seconds
  - Hard: 180 seconds

### Difficulty Levels
- **😊 Easy**: 6 pairs (12 cards) - Perfect for beginners
- **🤔 Medium**: 10 pairs (20 cards) - Balanced challenge
- **🔥 Hard**: 16 pairs (32 cards) - For memory masters

### Visual Effects
- **3D Card Flip Animations**: Smooth CSS 3D transforms
- **Match Celebration**: Cards pulse and glow when matched
- **Card Shake**: Wrong matches shake the cards
- **Confetti Bursts**: Celebrate matches with confetti
- **Win Confetti Rain**: Epic confetti shower on game completion

### Sound Effects (Web Audio API)
- Card flip sounds
- Match found chime
- No match buzz
- Game won fanfare
- Combo streak sounds
- Toggle sound on/off

### Game Mechanics
- **Streak System**: Build consecutive match streaks
- **Combo Text**: Visual feedback for streaks (2x, 3x+)
- **Star Rating**: Get 1-3 stars based on performance
- **Best Score Tracking**: Track your personal bests

### Leaderboard
- Save scores to MongoDB
- View top 10 players per difficulty
- Track moves, time, and mode

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI framework
- **CSS3** - Styling with animations and 3D transforms
- **Web Audio API** - Sound effects (no external libraries)

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (v8 or higher) - Comes with Node.js
- **MongoDB** (v6 or higher) - [Download](https://www.mongodb.com/try/download/community)
  - Or use MongoDB Atlas (cloud database)

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/memory-card-game.git
cd memory-card-game
```

### 2. Install Root Dependencies

```bash
npm install
```

### 3. Install Server Dependencies

```bash
cd server
npm install
```

### 4. Install Client Dependencies

```bash
cd ../client
npm install
```

### 5. Set Up Environment Variables

Create a `.env` file in the `server` directory:

```bash
cd ../server
cp .env.example .env
```

Edit the `.env` file with your MongoDB connection string:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/memory-card-game
```

**For MongoDB Atlas:**
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/memory-card-game?retryWrites=true&w=majority
```

## 🏃 Running the Application

### Option 1: Run Both Server and Client (Recommended)

From the root directory:

```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend (port 3000) concurrently.

### Option 2: Run Server and Client Separately

**Terminal 1 - Backend Server:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend Client:**
```bash
cd client
npm start
```

### 3. Open Your Browser

Navigate to: [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
memory-card-game/
├── client/                    # React frontend
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── components/
│       │   ├── MemoryCardGame.js    # Main game component
│       │   ├── MemoryCardGame.css   # Game styles
│       │   ├── Confetti.js          # Confetti animation
│       │   └── Confetti.css         # Confetti styles
│       ├── utils/
│       │   └── soundEffects.js      # Web Audio API sounds
│       ├── App.js
│       ├── App.css
│       └── index.js
├── server/                    # Express backend
│   ├── server.js              # Main server file
│   ├── .env                   # Environment variables
│   └── package.json
├── package.json               # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Scores

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/scores` | Get top scores (query: `difficulty`, `limit`) |
| POST | `/api/scores` | Save a new score |
| GET | `/api/scores/:id` | Get score by ID |

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Server health check |

## 🎯 How to Play

1. **Choose Game Mode**: Classic (no timer) or Countdown (timed)
2. **Select Difficulty**: Easy, Medium, or Hard
3. **Click a Card**: Reveals the hidden emoji
4. **Click Another Card**: Try to find a matching pair
5. **Match Found**: Cards stay flipped and glow
6. **No Match**: Cards flip back after 1 second
7. **Find All Pairs**: Complete the game to win!
8. **Save Your Score**: Enter your name for the leaderboard

### Scoring System

- **Star Rating**: Based on moves (fewer moves = more stars)
- **Streak Bonus**: Consecutive matches build your streak
- **Countdown Bonus**: Time remaining affects star rating

## 🎨 Customization

### Adding New Emoji Sets

Edit `client/src/components/MemoryCardGame.js`:

```javascript
const CARD_SETS = {
  easy: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊'],
  medium: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯'],
  hard: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔']
};
```

### Adjusting Time Limits

Edit the countdown timer limits:

```javascript
const TIME_LIMITS = {
  easy: 60,      // 1 minute
  medium: 120,   // 2 minutes
  hard: 180      // 3 minutes
};
```

## 🐛 Troubleshooting

### MongoDB Connection Issues

1. Make sure MongoDB is running:
   ```bash
   mongod
   ```

2. Check your connection string in `.env`

3. For MongoDB Atlas, ensure your IP is whitelisted

### Port Already in Use

If port 5000 or 3000 is already in use:

**Server (port 5000):**
```bash
# Change PORT in server/.env
PORT=5001
```

**Client (port 3000):**
```bash
PORT=3001 npm start
```

### Sound Not Working

- Click anywhere on the page first to initialize the Web Audio API
- Check if sound is muted (click the 🔊/🔇 button)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 🙏 Acknowledgments

- Emoji icons provided by Unicode Consortium
- Sound effects created using Web Audio API
- Confetti animation inspired by canvas-confetti library

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Made with ❤️ using the MERN Stack**

**Happy Gaming! 🎮🧠**
