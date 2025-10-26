# StreamCore — Open Source Video Backend

StreamCore is an **open, modern video backend** designed for developers, businesses, and contributors. It provides APIs and tools to handle video uploads, transcoding, streaming, and analytics with a developer-friendly architecture built on **NestJS**.

---

## 🎯 Vision

> Build the open, modern video backend API for developers & media apps.

StreamCore aims to make video infrastructure as simple as integrating an API — while remaining fully open source and self-hostable.

---

## 🧩 Core Features

* 🎞️ Chunked video upload
* ⚙️ Automatic transcoding (FFmpeg)
* 📺 Adaptive HLS streaming delivery
* 🔔 Webhooks for upload, transcoding, and delivery events
* 📊 Analytics API (views, watch time, etc.)
* 🧰 REST API + optional Next.js frontend starter
* 🪣 S3-compatible storage (AWS S3 / Cloudflare R2 / MinIO)
* 🧮 Job queue via BullMQ (Redis)

---

## 🧱 Tech Stack

| Layer       | Technology                     |
| ----------- | ------------------------------ |
| Backend     | NestJS                         |
| Database    | MongoDB (Mongoose)             |
| Queue       | BullMQ (Redis)                 |
| Storage     | S3-compatible (R2, MinIO, AWS) |
| Transcoding | FFmpeg                         |
| Auth        | JWT + optional OAuth (Google)  |
| Docs        | Swagger (OpenAPI)              |

---

## ⚙️ Local Development Setup

### 1️⃣ Prerequisites

* Node.js ≥ 18
* Docker + Docker Compose
* Git

### 2️⃣ Clone the Repository

```bash
git clone https://github.com/abdurrehman-26/streamcore.git
cd streamcore
```

### 3️⃣ Copy and Edit Environment File

```bash
cp .env.example .env
```

Update values (MongoDB URI, Redis, JWT secrets, S3 credentials, etc.)


### 4️⃣ Install Dependencies & Run the Server

```bash
npm install
npm run start:dev
```

Server will start on [http://localhost:3000](http://localhost:3000)

---

## 🧪 Testing

Run Jest tests:

```bash
npm run test
```

---

## 🧾 License

Licensed under the **Apache License 2.0** — see [LICENSE](./LICENSE) for details.

Copyright © 2025 Abdur Rehman

---

## 📢 Community

* Follow progress with #buildinpublic posts on LinkedIn
* Join Discord/Slack (coming soon)
* Contribute or test early versions

---

**StreamCore** — Open Source Video Backend for Developers 🚀
