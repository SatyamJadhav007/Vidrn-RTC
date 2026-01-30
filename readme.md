# Vidrn-RTC

**Vidrn-RTC** is a real-time language exchange platform focused on **1-to-1 video calling and chat**, built to deeply understand how **WebRTC (P2P)**, **Socket.IO**, and **Redis-based caching** work together in a production-style system. The project emphasizes low-latency peer-to-peer communication, real-time notifications, and efficient server-side data access through targeted caching and invalidation, while maintaining secure, stateless authentication and a clean, theme-rich UI.

---

## 🚀 Highlights & Features

- 🔐 **JWT Authentication (Stateless Cookies)** with protected routes and server-side auth validation.
- 🌍 **Language Exchange Platform** with **32 unique UI themes** for a personalized experience.
- 📹 **Real-Time 1‑to‑1 Video Calling (WebRTC)**
  - Peer-to-peer media streams for low latency
  - Signaling via Socket.IO
  - ICE candidate queuing and exchange for reliable connections

- 💬 **Real-Time Chat & Messaging**
  - 1‑to‑1 messaging using Socket.IO events
  - Server-side socket mapping to ensure messages are delivered to the correct peer

- 🔔 **Real-Time Notifications**
  - Instant friend-request notifications between online users
  - Socket.IO integrated with **TanStack Query** for real-time emits and async state consistency

- 🏪 **Redis Caching**
  - Server-side caching for frequently requested user and social graph data
  - Explicit cache invalidation on friend-request lifecycle events
  - Configured with a resilient reconnection strategy to handle transient connection drops

- 🧠 **State Management with Zustand**
  - WebRTC signaling state management
  - ICE candidate queue handling
  - Media stream state storage
  - Socket connection state for auth validation and event emits between two users

- ⚡ **Modern Tech Stack**
  - **Frontend:** React.js, TailwindCSS, TanStack-Query, Zustand, JavaScript
  - **Backend:** Express.js, MongoDB, Socket.IO, Node.js
  - **Caching:** Upstash Redis (node-redis with TLS)
  - **Real-Time:** WebRTC (P2P), Socket.IO

- 🎨 **lucide-react** for clean, consistent icons

---

## 🧠 Architecture Overview

- **WebRTC** handles peer-to-peer audio/video streaming.
- **Socket.IO** is used for:
  - WebRTC signaling (offer/answer exchange)
  - ICE candidate transfer
  - Real-time chat messages
  - Friend-request notifications

- **Server-side socket map** maintains active user–socket relationships, enabling:
  - Accurate signaling between two users
  - Secure 1‑to‑1 messaging

- **TanStack Query** is used for handling async server state such as authentication flows (login, signup, logout).

- **Socket.IO** is integrated with TanStack Query specifically for real-time notifications (e.g., friend requests), ensuring UI state stays in sync for online users.

- **Redis** is used as a caching layer to optimize frequently accessed, read-heavy queries:
  - `getRecommendedUsers` (5-minute TTL)
  - `getMyFriends` (10-minute TTL)
  - `getFriendRequests` and `getOutgoingFriendReqs` (2-minute TTL)
  - Targeted cache invalidation is performed on `sendFriendRequest` and `acceptFriendRequest` mutations to ensure data consistency

---

## 🧪 Environment Setup

### Backend (`/backend`)

Create a `.env` file:

```env
PORT=5001
MONGO_URI=your_mongo_uri

JWT_SECRET_KEY=your_jwt_secret
NODE_ENV=development

# Upstash Redis (get from Upstash dashboard)
UPSTASH_REDIS_URL=rediss://default:xxx@xxx.upstash.io:6379
```

---

## 🔧 Run the Backend (Locally)

```bash
cd backend
npm install
npm run dev
```

---

## 💻 Run the Frontend (Locally)

```bash
cd frontend
npm install
npm run dev
```

---

## 🎯 Project Goal

The primary goal of **Vidrn-RTC** is to **deeply understand and implement real-time communication systems**, specifically:

- WebRTC peer-to-peer video calling
- Socket.IO–based signaling and messaging
- Real-time notifications and presence-aware interactions

While the platform is designed for language exchange, its core strength lies in demonstrating a **production-style real-time architecture** for video, chat, and notifications.

---

## 📌 Status

✅ **Completed / Developed** — The core platform is fully implemented and functional.

The project remains **open for future improvements**, with known scope for architectural enhancements, particularly around **Socket.IO handling and scalability** (e.g., socket lifecycle management,Handling group chats and calls, horizontal scaling, and event orchestration).

---

Feel free to explore, fork, and experiment with real-time communication patterns using **Vidrn-RTC**.

**Thanks For Reading** 😊
