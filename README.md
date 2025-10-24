# 🏃‍♂️ RunBuddy

**Training buddy web app powered by LLM integration and Strava data.**

RunBuddy helps runners design, adapt, and reflect on personalized training plans.  
It connects with Strava to auto-generate schedules, provide intelligent feedback, and act as your virtual running coach.

---

## 🚀 Features

---

## 🧩 Tech Stack

Insert

---

## 📂 Project Structure

```

runbuddy/
├── client/        # Next.js frontend
├── model/         # Model files
├── server/        # This is empty right now
└── README.md

````

---

## 💻 Getting Started

### 1️⃣ Clone the repository
```bash
git clone https://github.com/<your-username>/runbuddy.git
cd runbuddy
````

### 2️⃣ Install dependencies

```bash
cd client
npm install
```

### 3️⃣ Run the development server

```bash
npm run dev
```

### 4️⃣ Open in browser

```
http://localhost:3000
```

---

## ⚙️ Environment Variables

Create a `.env.local` file inside the `client/` folder:

```bash
NEXT_PUBLIC_STRAVA_CLIENT_ID=your_strava_client_id
NEXT_PUBLIC_STRAVA_REDIRECT_URI=http://localhost:3000/api/auth/callback
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Backend `.env` (if applicable):

```bash
NEXT_PUBLIC_STRAVA_CLIENT_ID=178531
NEXT_PUBLIC_STRAVA_CLIENT_SECRET=139866d736bea7d825cdeb3401cf5bc96063fe04
STRAVA_CLIENT_ID=178531
STRAVA_CLIENT_SECRET=139866d736bea7d825cdeb3401cf5bc96063fe04
```

---

## 🧠 Roadmap

* [ ] Insert

---

## 📜 License

MIT License © 2025 Joel Sng

---

### ❤️ Built for runners who love data and progress.