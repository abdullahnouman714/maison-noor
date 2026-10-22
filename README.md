# Maison Noor — AI-Powered Perfume & Attar Store

A full-stack e-commerce demo built to showcase **MERN + AI Agents**: a luxury perfume store where an AI assistant sells, an AI summarizes reviews, and an agentic Copilot answers the owner's questions from live store data.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Abdullah%20Nouman-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/abdullah-nouman-542410349)
[![GitHub](https://img.shields.io/badge/GitHub-abdullahnouman714-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/abdullahnouman714)

**Built by Abdullah Nouman** — Full-Stack Developer (MERN · Laravel · Generative AI · Agentic AI)
📧 abdullahnouman714@gmail.com · [LinkedIn](https://www.linkedin.com/in/abdullah-nouman-542410349) · [GitHub](https://github.com/abdullahnouman714)

## ✦ AI Features (the differentiators)
1. **Noor — AI Shopping Assistant** (chat widget, bottom-right): grounded only in live catalogue + policy data (RAG-style). Recommends by occasion/budget ("a light office scent under $60"), explains shipping/returns, and tracks real orders by ID.
2. **Semantic Search**: "gift for my father, deep woody smell" ranks products by meaning, not keywords.
3. **AI Review Summarizer**: one-line buyer-sentiment summary on every product page (cached; LLM-generated when an API key is present).
4. **Admin AI Copilot**: tool-calling agent in the admin panel — `querySales()`, `lowStockReport()`, `topProducts()`, `customerStats()` over live data.

Add `GEMINI_API_KEY` or `OPENAI_API_KEY` in `server/.env` and the assistant/summarizer switch from smart demo mode to a real LLM — no code changes.

## Architecture (matches the build plan)
```
client/  React app — pages, components (ChatWidget), zustand store
server/
  src/routes/      auth · products · orders · users · admin · ai · webhooks (Stripe)
  src/ai/          embeddings.js (provider or local vectors) · rag.js (cosine retrieval =
                   local stand-in for Atlas $vectorSearch) · assistant.js (tools:
                   searchProducts, getProductDetails, trackOrder, addToCart) ·
                   summarizer.js (ProductSummary cache) · copilot.js (querySales,
                   lowStockReport, topProducts, customerStats)
  src/services/    stripe.js · email.js (Resend) · cloudinary.js
  src/middleware/  auth (JWT) + adminOnly
  src/models/      Mongoose schemas: User, Product, Order, Review, Coupon, ChatLog,
                   ProductSummary, PolicyDoc, Embedding
seed/              products.json (30 products) + seed.js (Mongo import when MONGODB_URI set)
```
Chat is logged to the ChatLog collection; the assistant also streams (SSE at
POST /api/ai/chat/stream) and returns the tool calls it made. Wishlist syncs to
the server per user. Coupons: NOOR10 (10%), ATTAR15 (15% over $60), FIRST50 ($50 over $150).

## Store Features
- Home (animated hero, scent families, bestsellers), Shop (filters, sort, price slider, semantic search)
- Product pages: variants (30/50/100ml), scent-notes pyramid, verified-purchase reviews, AI summary
- Cart + wishlist, JWT auth (register/login), Stripe test-mode checkout (4242…), order tracking timeline
- Admin: revenue/order stats, sales-by-day chart, order status management, low-stock alerts, AI Copilot

## Tech Stack
React + Vite + Tailwind CSS + Framer Motion + Zustand · Node.js + Express · MongoDB (Mongoose schemas in `server/src/models/`; demo runs on a seeded in-memory store for zero-setup) · JWT + bcrypt · Stripe · Optional: Gemini / OpenAI

## Run It (2 terminals)
```bash
# Terminal 1 — API (http://localhost:5000)
cd server && npm install && npm run dev

# Terminal 2 — Store (http://localhost:5173)
cd client && npm install && npm run dev
```

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Customer | demo@maisonnoor.com | demo1234 |
| Admin | admin@maisonnoor.com | admin123 |

Sample order IDs for tracking/chat: **MN-10240, MN-10247, MN-10254**

## Deploy — free, no card (Vercel, everything in one project)
The repo is wired so the **whole app (website + API) deploys to Vercel free**:
`vercel.json` builds the client as a static site and runs the Express API as a
serverless function from `/api/index.js` (the app itself is exported from
`server/src/app.js`; `server/src/index.js` is only for local/traditional hosting).

1. Push this repo to GitHub.
2. On vercel.com → Add New Project → import the repo.
3. **Root Directory: leave it as the repo root** (do NOT pick client) — no env vars needed.
4. Deploy. One link runs everything: site, products, AI chat, admin.

Note: the demo data lives in memory, so on serverless it can reset when the
function goes cold — perfect for demos. For real production, connect MongoDB
Atlas (schemas ready in `server/src/models/`, seed in `seed/seed.js`).
Local/traditional hosting still works exactly as below.

## Project Structure
```
client/   React app (pages, components, zustand store)
server/   Express API — src/index.js (routes), src/ai.js (assistant, semantic search,
          summarizer, copilot), src/data.js (seed: 30 products, reviews, orders, policies),
          src/models/ (Mongoose schemas for production MongoDB Atlas)
```

*Portfolio demo project — products, reviews and orders are realistic seed data.*
