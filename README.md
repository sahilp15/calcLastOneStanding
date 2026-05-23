# Last One Standing — Calculus Challenge

> Real-time multiplayer calculus elimination game for the classroom

![Game Screenshot](docs/screenshot.png)

## What is this?

Last One Standing is a Kahoot-style elimination game specifically designed for university Calculus classes. Students compete in real-time: answer series convergence problems correctly to survive each round. One wrong answer and you're eliminated. The last student standing wins.

## Features

- **Real-time multiplayer** — Socket.IO with server-authoritative timers
- **Beautiful LaTeX math** — KaTeX rendering for professional-quality equations
- **30–100 players** — Designed for full classroom use
- **Elimination gameplay** — Wrong answer = eliminated, spectate the rest
- **Adaptive difficulty** — Questions progress from easy to hard
- **Host dashboard** — Live player count, elimination feed, leaderboard
- **Reconnection handling** — Students can reconnect without losing their spot
- **Admin panel** — Add/edit/delete questions with LaTeX preview
- **Docker ready** — Single `docker-compose up` deployment

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15, React 19, TypeScript |
| Styling | Tailwind CSS, Framer Motion |
| Math | KaTeX |
| Real-time | Socket.IO |
| Database | PostgreSQL + Prisma |
| Cache | Redis |
| UI Components | shadcn/ui + Radix UI |
| Deployment | Docker Compose |

## Quick Start (Docker)

```bash
# Clone the repository
git clone <repo-url>
cd calcLastOneStanding

# Copy environment variables
cp .env.example .env.local

# Start everything (app + postgres + redis + adminer)
docker-compose up -d

# Game is live at http://localhost:3000
# Admin panel at http://localhost:3000/admin  (password: admin123)
# Adminer (DB UI) at http://localhost:8080
```

To stop:

```bash
docker-compose down
```

To stop and remove all data volumes:

```bash
docker-compose down -v
```

## Local Development

**Prerequisites:** Node.js 20+, PostgreSQL 16, Redis 7

```bash
# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your local database credentials

# Push schema to the database and seed questions
npm run db:push
npm run db:seed

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `PORT` | Server port | `3000` |
| `ADMIN_PASSWORD` | Admin panel password | `admin123` |
| `NEXT_PUBLIC_APP_URL` | Public URL of the app | `http://localhost:3000` |

Copy `.env.example` to `.env.local` and fill in the values before running.

## Database Setup

```bash
# Apply all pending migrations
npm run db:migrate

# Or push the schema directly (dev only, no migration history)
npm run db:push

# Seed the database with sample calculus questions
npm run db:seed

# Open Prisma Studio to browse data
npx prisma studio
```

## How to Play

### For Teachers (Host)

1. Go to `/host` on the classroom TV or projector
2. Click **Create Game** — you'll get a 6-letter room code
3. Display the room code (and join URL) for students
4. Wait for students to join the lobby
5. Click **Start Game** when ready
6. Click **Next Round** to advance between rounds
7. The game automatically eliminates players who answer incorrectly
8. The last student standing wins!

### For Students

1. Go to `/play` on your laptop or phone
2. Enter the room code and your nickname
3. Click **Join Game**
4. Wait in the lobby for the teacher to start
5. When the question appears, click your answer before the timer runs out
6. Survive all rounds to win!

## Game Rules

- Each round displays a calculus problem with 4 multiple-choice answers
- Students have 20–30 seconds to answer (time scales with difficulty)
- A wrong answer means immediate elimination
- Failing to answer before the timer expires also counts as elimination
- If nobody answers correctly, it is a mercy round and nobody is eliminated
- Players earn points for correct answers plus a speed bonus
- Eliminated players become spectators and can follow along
- The last surviving player wins

## Question Topics

- Ratio Test and Root Test
- Comparison Test and Limit Comparison Test
- Integral Test
- P-Series
- Taylor and Maclaurin Series
- Radius and Interval of Convergence
- Alternating Series Test
- Absolute vs Conditional Convergence

## Admin Panel

Navigate to `/admin` and enter the admin password (default: `admin123`) to:

- View all questions with difficulty ratings and topic tags
- Add new questions with a LaTeX editor and live preview
- Edit or delete existing questions
- Filter questions by topic or difficulty level

## Architecture

```
Browser (Students) ─────┐
Browser (Host/TV) ──────┼──── Socket.IO ──── Game Engine (in-memory)
                         │         │
                         │         ├── Prisma ──── PostgreSQL (questions, history)
                         │         └── Redis  ──── pub/sub, sessions
                         │
                    Next.js App Router (UI pages, API routes)
```

The custom `server.ts` boots an Express/HTTP server that mounts both the Next.js request handler and a Socket.IO instance, allowing real-time events and SSR to share the same port.

## Deployment

### Production with Docker Compose

```bash
# Edit .env.local (or set environment variables) with production values
docker-compose up -d --build
```

### Manual Production Build

```bash
npm run build
npm run db:migrate
NODE_ENV=production npm start
```

### Reverse Proxy with Nginx

WebSocket upgrade headers are required for Socket.IO to work correctly behind a proxy.

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

For HTTPS, obtain a certificate via Certbot and add the standard SSL directives.

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add your feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

Please make sure to update or add questions in `prisma/seed.ts` when adding new question topics.

## License

MIT
