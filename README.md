# Samuel Tic-Tac-Toe

A modern, responsive, blue-themed Tic-Tac-Toe web application built with **React** and **Vite**, branded for **Chukwuma Samuel**.

---

## 🌟 Key Features

- **Chukwuma Samuel Signature Brand**: Clean aesthetic with deep blue primary tokens (`#2563EB`, `#1D4ED8`, `#DBEAFE`).
- **2-Player Local Gameplay**: Fast turn-taking between Player X and Player O.
- **Accurate Win & Draw Detection**: Instantly checks all 8 winning combinations across rows, columns, and diagonals.
- **Winning-Cell Highlight**: Glowing visual pulse and banner announcement on win.
- **Victory Celebration**: Animated confetti effect on player victory.
- **Score Tracking**: Live tally for Player X wins, Player O wins, and Draws.
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
│   │   ├── Board.jsx           # 3x3 Grid Container
│   │   ├── Cell.jsx            # Interactive Cell Button
│   │   ├── Footer.jsx          # Samuel Brand Footer
│   │   ├── GameStatus.jsx      # Turn & Outcome Status Banner
│   │   ├── Header.jsx          # Chukwuma Samuel Header
│   │   ├── NewGameButton.jsx   # Restart & Reset Controls
│   │   └── ScoreBoard.jsx      # Score Counters
│   ├── utils/
│   │   └── gameLogic.js        # Pure Win/Draw Detection Engine
│   ├── App.jsx                 # Top-Level Game Controller
│   ├── index.css               # Design System & Styling
│   └── main.jsx                # React Entry Point
└── README.md
```

---

## 👨‍💻 Author

**Chukwuma Samuel**
Signature Games & Modern Web Experiences

