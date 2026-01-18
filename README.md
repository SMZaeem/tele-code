# ⚡ Tele-Code: Real-Time Ephemeral Collaboration

![Node.js](https://img.shields.io/badge/Node.js-v18-green.svg)
![React](https://img.shields.io/badge/React-v18-blue.svg)
![Redis](https://img.shields.io/badge/Redis-Caching-red.svg)

**Tele-Code** is a real-time collaborative workspace that allows users to share text, code, and files instantly without logins or signups. 

Built to solve the friction of moving snippets and files between devices, it features **Conflict-Free Text Syncing**, **Serverless File Uploads**, and **Automatic Data Purging**.

---

## 🚀 Key Features

* **Real-Time Collaboration:** Multi-user text editing with millisecond latency using **Yjs (CRDTs)** and WebSockets.
* **Ephemeral Rooms:** Rooms and their data automatically self-destruct after **24 hours** of inactivity (powered by Redis TTL).
* **Secure File Sharing:** Direct-to-cloud file uploads using **AWS S3 Presigned URLs** (server never bottlenecks on binary data).
* **Minimalist "Writer" Mode:** Distraction-free, "Medium-style" editor interface with a custom Monaco theme.
* **Global Sync:** "Delete for Everyone" functionality ensures state consistency across all connected clients.

---

## 🛠️ Tech Stack

### Frontend
* **Framework:** React (Vite)
* **Styling:** Tailwind CSS (Dark/Minimalist Theme)
* **Editor Engine:** Monaco Editor (VS Code core) + Yjs (CRDT Library)
* **State:** Socket.io Client + React Hooks

### Backend
* **Runtime:** Node.js (Express)
* **Real-Time Engine:** Socket.io + y-socket.io
* **Database (Ephemeral):** Redis (ioredis) for metadata & TTL management
* **Storage:** AWS S3 (via AWS SDK v3)

---

## 🏗️ System Architecture

### 1. Conflict-Free Editing (CRDTs)
Unlike standard WebSocket apps that just send strings back and forth, Tele-Code uses **Conflict-free Replicated Data Types (CRDTs)**.
* When User A and User B type simultaneously, Yjs merges the changes mathematically.
* This prevents "cursor jumping" and ensures eventual consistency without a central source of truth.

### 2. The "Leaky Bucket" Lifecycle (Redis)
To keep the system lightweight and cost-effective:
* Every room key in Redis has a **TTL (Time-To-Live)** of 24 hours.
* Any activity (typing, uploading) resets the timer.
* If a room goes silent, Redis automatically evicts the data, keeping the database footprint small.

### 3. Serverless File Uploads
Instead of streaming 50MB files through the Node.js server (which would block the Event Loop), we use **Presigned URLs**:
1.  Client requests a "permission slip" from the Server.
2.  Server authenticates and generates a secure, temporary AWS S3 URL.
3.  Client uploads the file **directly to AWS S3**.
4.  Server is only notified when the upload is complete.

---

## 📦 Installation & Setup

### Prerequisites
* Node.js (v16+)
* Redis (Local or Upstash Cloud)
* AWS Account (Optional - for file uploads)

### 1. Clone the Repository
```bash
git clone [https://github.com/yourusername/Tele-Code.git](https://github.com/yourusername/Tele-Code.git)
cd Tele-Code

```

### 2. Backend Setup

```bash
cd server
npm install

# Create a .env file
touch .env

```

**Add the following to `server/.env`:**

```env
PORT=3001
CLIENT_URL=http://localhost:5173
REDIS_URL=redis://localhost:6379 

# AWS S3 Configuration (Optional - Required for file uploads)
AWS_REGION=your-region
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_BUCKET_NAME=your-bucket-name

```

**Start the Server:**

```bash
npm run dev

```

### 3. Frontend Setup

```bash
cd client
npm install

# Create a .env file
touch .env

```

**Add the following to `client/.env`:**

```env
VITE_BACKEND_URL=http://localhost:3001

```

**Start the Client:**

```bash
npm run dev

```

---

## 📸 Usage Guide

1. Open the app. You will be redirected to a unique Room URL (e.g., `/home/uuid`).
2. **Share the Link:** Send the URL to a friend or open it on your phone.
3. **Collaborate:** Type in the editor. Text syncs instantly.
4. **Share Files:** Click the folder icon (bottom right) to upload files.
5. **Clean Up:** Click the Trash icon next to a file to delete it for everyone.

---

## 🛡️ Future Improvements

* [ ] End-to-End Encryption (E2EE) for text content.
* [ ] Password protection for specific rooms.
* [ ] Syntax highlighting selector for the Editor.
* [ ] Support for file previews (Images/PDFs) directly in the app.

---


Built with ❤️ by SYED MOHAMMAD ZAEEM

```

```
