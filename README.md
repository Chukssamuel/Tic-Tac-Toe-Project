# Samuel Tic-Tac-Toe

A modern, responsive, emerald-themed Tic-Tac-Toe web application built with **React** and **Vite**, branded for **Chukwuma Samuel**.

---

## 🌟 Key Features

- **Chukwuma Samuel Signature Brand**: Clean aesthetic with emerald primary tokens (`#059669`, `#047857`, `#A7F3D0`).
- **2-Player Local Gameplay**: Fast turn-taking between Player X and Player O.
- **Play vs Computer AI**: Three difficulty levels (Easy / Medium / Hard) — and you can play as **X or O** (the AI moves first when you pick O).
- **Adjustable Board Sizes**: Play on a classic **3×3**, or larger **4×4** and **5×5** grids.
- **Match Clock**: Optional chess-style time bank per player — run out of time and you lose the round.
- **Undo Move**: Take back your last move (in AI mode, undoes your move and the AI's reply together).
- **Custom Visual Themes**: Classic Emerald, Neon Glow, Cyberpunk, Minimalist, Glassmorphism, and **Forest** — plus Light/Dark modes.
- **Sound starts muted** by default; synthesized Web Audio effects can be unmuted anytime.
- **Accurate Win & Draw Detection**: Instantly checks all rows, columns, and diagonals at any board size.
- **Winning-Cell Highlight**: Glowing visual pulse and banner announcement on win.
- **Victory Celebration**: Animated confetti effect on player victory.
- **Score Tracking**: Live tally for Player X wins, Player O wins, and Draws, plus win streaks and match history.
- **Full Keyboard & ARIA Accessibility**: Proper ARIA roles, live regions for status updates, and keyboard focusable cells.
- **Responsive Layout**: Designed for seamless play across mobile phones, tablets, and desktop displays.

---

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/)
- **Build Tool:** [Vite](https://vitejs.dev/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Effects:** [Canvas Confetti](https://www.npmjs.com/package/canvas-confetti)
- **Styling:** CSS3 Custom Properties & Modern Responsive Grid

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```

### 3. Build for Production
```bash
npm run build
```

### 4. Preview Production Build
```bash
npm run preview
```

---

## 📂 Project Structure

```text
samuel-tictactoe/
├── index.html                  # HTML Shell & Meta Tags
├── package.json                # Project Dependencies & Scripts
├── vite.config.js              # Vite React Plugin Configuration
├── src/
│   ├── components/
│   │   ├── Board.jsx           # Grid Container (3x3 / 4x4 / 5x5)
│   │   ├── Cell.jsx            # Interactive Cell Button
│   │   ├── Footer.jsx          # Samuel Brand Footer
│   │   ├── GameStatus.jsx      # Turn & Outcome Status Banner
│   │   ├── Header.jsx          # Chukwuma Samuel Header (with More menu)
│   │   ├── ModeSelector.jsx    # Mode, side, board size, clock & difficulty
│   │   ├── NewGameButton.jsx   # Undo / Restart / Reset Controls
│   │   └── ScoreBoard.jsx      # Score Counters + Match Clock
│   ├── utils/
│   │   ├── gameLogic.js        # Pure Win/Draw Detection (any board size)
│   │   ├── aiLogic.js          # AI Engine (Easy / Medium / Hard)
│   │   ├── soundEffects.js     # Synthesized Web Audio Effects
│   │   └── storage.js          # Local Storage & Persistence
│   ├── App.jsx                 # Top-Level Game Controller
│   ├── index.css               # Design System & Styling
│   └── main.jsx                # React Entry Point
└── README.md
```

---

## 👨‍💻 Author

**Chukwuma Samuel**
Signature Games & Modern Web Experiences

