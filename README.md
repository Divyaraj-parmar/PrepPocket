# PrepPocket 🎒

> A centralized cross-platform DSA & developer study aggregator designed to replace cluttered browser bookmarks.

![PrepPocket Banner](https://img.shields.io/badge/Stack-React%2019%20%7C%20Node.js%20%7C%20Express%205%20%7C%20MongoDB-blue)
![License](https://img.shields.io/badge/license-ISC-green)

---

## 💡 The Problem PrepPocket Solves

Preparing for technical interviews usually leads to **50+ open tabs and scattered browser bookmarks** across LeetCode, GeeksforGeeks, HackerRank, YouTube tutorials, and technical articles. When it comes time to revise, finding that specific dynamic programming trick or system design note becomes frustrating and slow.

**PrepPocket** solves this by acting as your unified preparation dock:
- **One place for everything**: Bookmark problems and notes with tags, summary notes, and direct links.
- **Smart platform detection**: Automatically parses URLs and provides branded badges for LeetCode, GFG, HackerRank, YouTube, Medium, and more.
- **One-click solve**: Jump straight into solving the problem without searching again.
- **Sub-second search**: Instant multi-criteria filtering across titles, concepts, solution hints, and tags.

---

## ✨ Features

- **Categorized Hub**: Dual-mode navigation separating conceptual learning **Notes** (`N`) from hands-on **Practice Questions** (`Q`).
- **Full CRUD Support**: Add, view, edit, and delete items with persistent storage in MongoDB Atlas.
- **Theme-Based Confirmation Dialog**: Custom modal for destructive actions with item preview and keyboard accessibility (`Escape`).
- **Domain & Platform Recognition**: Automatic detection and badge styling for LeetCode, HackerRank, GeeksforGeeks, MDN, Dev.to, GitHub, and YouTube.
- **Responsive & Modern Design**: Clean slate/monochrome aesthetic built with React 19, smooth micro-interactions, and accessible dialogs.

---

## 🛠 Tech Stack

- **Frontend**: React 19, Vite, Vanilla CSS (Design System Tokens)
- **Backend**: Node.js (ES Modules), Express 5, Mongoose
- **Database**: MongoDB Atlas

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### 1. Clone & Setup Backend
```bash
cd backend
npm install
# Configure your .env file with PORT and MONGODB_URL
npm run dev
```

### 2. Setup Frontend
```bash
cd ../notes-ui
npm install
npm run dev
```

The web application will be live at `http://localhost:5173` with the API running on `http://localhost:4001`.

---

## 📝 License
ISC © [Divyarajsinh Parmar](https://github.com/divyarajsinhparmar)
