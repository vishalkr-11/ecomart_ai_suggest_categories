# EcoMart AI Backend

> Production-ready Node.js + Express + MongoDB backend for an AI-powered sustainable B2B commerce platform.

---

## System Architecture Diagram

```
Client / Frontend
       │
       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         Express API Server                          │
│                                                                     │
│  ┌─────────────┐   ┌──────────────────────────────────────────┐    │
│  │  Middleware  │   │               Route Layer                │    │
│  │  • Helmet   │   │  /api/v1/categories  /api/v1/proposals   │    │
│  │  • CORS     │   └──────────────┬───────────────────────────┘    │
│  │  • Rate Lmt │                  │                                 │
│  │  • Req Log  │       ┌──────────▼──────────┐                     │
│  └─────────────┘       │    Controller Layer  │  ← HTTP only        │
│                        │  (input validation,  │                     │
│                        │   response shaping)  │                     │
│                        └──────────┬──────────┘                     │
│                                   │                                 │
│                        ┌──────────▼──────────┐                     │
│                        │   Service Layer      │  ← Business logic   │
│                        │  categoryService     │                     │
│                        │  proposalService     │                     │
│                        └──────┬──────┬───────┘                     │
│                               │      │                              │
│              ┌────────────────┘      └──────────────┐              │
│              ▼                                       ▼              │
│  ┌───────────────────┐                 ┌──────────────────────┐    │
│  │   AI Service Layer│                 │    MongoDB Models     │    │
│  │   (LLM only)      │                 │  Category, Product,  │    │
│  │   • callAiWithRe- │                 │  CategoryResult,     │    │
│  │     try()         │                 │  Proposal, AiLog     │    │
│  │   • Retry logic   │                 └──────────────────────┘    │
│  │   • JSON parsing  │                              │               │
│  │   • Log to AiLog  │                              ▼               │
│  └─────────┬─────────┘                        MongoDB Atlas /      │
│            │                                  Local MongoDB         │
│            ▼                                                        │
│       OpenAI API                                                    │
│     (gpt-4o / JSON mode)                                           │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Folder Structure

```
ecomart-backend/
├── server.js                          # Entry point — bootstraps DB + HTTP server
├── package.json
├── .env.example                       # All required environment variables
│
├── scripts/
│   └── seedData.js                    # Seeds categories + sample products to MongoDB
│
└── src/
    ├── app.js                         # Express factory — registers all middleware + routes
    │
    ├── config/
    │   ├── database.js                # MongoDB connection with retry
    │   ├── logger.js                  # Winston structured logger (dev + prod modes)
    │   └── constants.js              # PRIMARY_CATEGORIES, SUSTAINABILITY_FILTERS, etc.
    │
    ├── models/                        # Mongoose schemas — pure data shape, no logic
    │   ├── Category.js               # Predefined product categories
    │   ├── Product.js                # B2B product catalogue with pricing tiers
    │   ├── CategoryResult.js         # AI categorisation results with full traceability
    │   ├── Proposal.js               # B2B proposals with verified budget breakdown
    │   └── AiLog.js                  # Central audit log of every AI API call
    │
    ├── controllers/                   # HTTP layer ONLY — no business logic here
    │   ├── categoryController.js     # Handles HTTP for Module 1
    │   └── proposalController.js     # Handles HTTP for Module 2
    │
    ├── services/                      # Business logic layer
    │   ├── ai/
    │   │   └── aiService.js          # LLM interaction ONLY — retry, parse, log
    │   ├── categoryService.js        # Module 1 orchestration
    │   └── proposalService.js        # Module 2 orchestration + budget verification
    │
    ├── routes/
    │   ├── categoryRoutes.js
    │   ├── proposalRoutes.js
    │   └── index.js                  # Master router
    │
    ├── middlewares/
    │   ├── errorHandler.js           # Global error handler + 404 handler
    │   └── requestLogger.js          # Stamps request ID, logs all HTTP in/out
    │
    └── utils/
        ├── prompts/
        │   ├── categoryPrompt.js     # Prompt builder for Module 1 (NEVER in controllers)
        │   └── proposalPrompt.js     # Prompt builder for Module 2
        ├── validators/
        │   ├── categoryValidator.js  # Joi schemas for request + AI response for M1
        │   └── proposalValidator.js  # Joi schemas + budget validation for M2
        ├── parseAiJson.js            # Safely strips markdown fences, parses JSON
        └── responseHelpers.js        # Standardised API response envelope helpers
```

---

## AI Prompt Design Reasoning

### Principle 1 — Constraint Injection at Prompt Level
The allowed primary category list is injected directly into the system prompt at runtime (fetched from the DB). The AI cannot invent categories outside this list because:
- It's instructed explicitly: "primaryCategory MUST be one of..."
- A Joi validator (`Joi.string().valid(...PRIMARY_CATEGORIES)`) rejects any hallucinated category
- On failure, the retry loop re-sends the same prompt, which typically self-corrects

### Principle 2 — Schema Enforcement in Prompt
Both prompts include a `REQUIRED OUTPUT SCHEMA` block showing exact field names and types. This, combined with OpenAI's `response_format: { type: "json_object" }` mode, eliminates markdown/prose contamination.

### Principle 3 — AI Provides Intent, Backend Provides Truth
For proposals, the AI only selects SKUs and suggested quantities. It is explicitly told "Do NOT calculate final prices." All pricing is resolved by `proposalService.js` against live DB records using bulk pricing tiers. AI-generated prices are never used.

### Principle 4 — Prompt Observability
Every prompt (system + user concatenated) is stored in the domain model (`CategoryResult.promptUsed`, `Proposal.promptUsed`) and in `AiLog.prompt`. This allows retroactive prompt debugging without code changes.

---

## Business Logic Separation

| Concern | Layer | File |
|---|---|---|
| HTTP parsing / response shaping | Controller | `controllers/*.js` |
| Business orchestration | Service | `services/categoryService.js`, `services/proposalService.js` |
| LLM API calls + retry | AI Service | `services/ai/aiService.js` |
| Prompt construction | Utils/Prompts | `utils/prompts/*.js` |
| Input validation (Joi) | Utils/Validators | `utils/validators/*.js` |
| AI response validation | Utils/Validators | `utils/validators/*.js` |
| Budget enforcement | Service | `proposalService.validateBudgetAllocation()` |
| DB schemas | Models | `models/*.js` |
| Env / secrets | Config | `.env` + `config/constants.js` |

**Controllers never call AI directly. AI service never writes to DB directly. Services orchestrate both.**

---

## Environment Setup

### 1. Prerequisites
- Node.js 18+
- MongoDB 6+ (local or Atlas)
- OpenAI API key

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env — set MONGODB_URI and OPENAI_API_KEY at minimum
```

### 4. Seed the Database
```bash
npm run seed
```
This creates:
- 10 predefined product categories
- 8 sample sustainable products with pricing tiers

### 5. Start the Server
```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## API Reference

### Module 1 — Category Generator

#### `POST /api/v1/categories/generate`
```json
// Request Body
{
  "productName": "EcoWrap Biodegradable Food Container",
  "productDescription": "Sugarcane bagasse food container, microwave-safe, certified compostable",
  "materials": ["sugarcane bagasse", "natural starch coating"],
  "targetAudience": "restaurants and food delivery businesses"
}

// Response 201
{
  "success": true,
  "data": {
    "requestId": "uuid-v4",
    "resultId": "mongo-object-id",
    "output": {
      "primaryCategory": "Packaging & Wrapping",
      "subCategory": "Compostable Food Containers",
      "seoTags": ["compostable-container", "bagasse-packaging", "eco-food-box", ...],
      "sustainabilityFilters": ["compostable", "plastic-free", "biodegradable"],
      "confidenceNote": ""
    },
    "aiMetadata": { "model": "gpt-4o", "totalTokens": 420, "latencyMs": 1240, "retryCount": 0 }
  }
}
```

#### `GET /api/v1/categories/results?page=1&limit=20`
#### `GET /api/v1/categories/results/:requestId`

---

### Module 2 — B2B Proposal Generator

#### `POST /api/v1/proposals/generate`
```json
// Request Body
{
  "clientType": "corporate",
  "budgetLimit": 150000,
  "currency": "INR",
  "eventType": "conference",
  "sustainabilityPreferenceLevel": "high",
  "headcount": 200,
  "notes": "Prefer items that can be branded with our logo"
}

// Response 201
{
  "success": true,
  "data": {
    "proposalCode": "ECO-COR-CON-ABC123",
    "lineItems": [
      {
        "productName": "Bamboo Ballpoint Pen Set",
        "sku": "OFF-BPEN-002",
        "quantity": 200,
        "unitPrice": 100,
        "lineTotal": 20000,
        "sustainabilityHighlight": "Replaces 600 single-use plastic pens"
      }
    ],
    "budgetSummary": {
      "budgetLimit": 150000,
      "totalAllocated": 143500,
      "remainingBudget": 6500,
      "isWithinBudget": true,
      "currency": "INR"
    },
    "impactPositioningSummary": "..."
  }
}
```

#### `GET /api/v1/proposals?page=1&limit=20`
#### `GET /api/v1/proposals/:proposalCode`
#### `GET /api/v1/proposals/request/:requestId`

---

## Architecture Design — Module 3: AI Impact Reporting Generator

### Overview
Aggregates product impact metrics across completed orders and generates AI-narrated sustainability reports.

### Components

**`models/ImpactReport.js`**
Stores per-order and cumulative impact metrics:
```
{ orderId, period, totalPlasticSavedGrams, totalCarbonAvoidedKg, productsBreakdown[], generatedSummary, createdAt }
```

**`services/impactService.js`**
- `calculateOrderImpact(orderId)` — Sums `plasticSavedPerUnitGrams × qty` and `carbonAvoidedPerUnitKg × qty` across all line items using values stored on Product model. No AI needed for base calculation.
- `generatePeriodReport(startDate, endDate)` — Aggregates across orders with MongoDB `$group` pipeline.
- `generateNarrativeSummary(impactData)` — Calls AI with numeric impact data; AI writes the human-readable sustainability story. Numbers come from DB — AI only narrates.

**`utils/prompts/impactPrompt.js`**
```
System: "You are a sustainability communications expert. Given verified impact numbers, write a compelling 3-paragraph report..."
User: "Plastic saved: 45kg, Carbon avoided: 12kg CO2e, Products used: [list]..."
```

**Calculation Strategy**
- Plastic saved: `product.impactMetrics.plasticSavedPerUnitGrams × quantity / 1000` → kg
- Carbon avoided: `product.impactMetrics.carbonAvoidedPerUnitKg × quantity`
- Per-report storage enables time-series queries without re-calculation

**Storage Strategy**
- Impact stored at order creation time (event-driven, via post-save hook)
- Cumulative reports re-generated on demand but cached for 24h
- Each report stored with `period`, `orderId`, and raw metric breakdown

---

## Architecture Design — Module 4: AI WhatsApp Support Bot

### Overview
Handles customer support queries via WhatsApp Business API using an AI chatbot with escalation to human agents.

### Webhook Flow
```
WhatsApp Cloud API → POST /api/v1/webhooks/whatsapp
  → webhookController.handleInbound()
  → whatsappService.processMessage()
  → [intent classification] → [order lookup / AI response]
  → whatsappService.sendReply()
  → WhatsApp Cloud API
```

**`controllers/webhookController.js`**
- `GET /webhooks/whatsapp` — Handles Meta webhook verification challenge
- `POST /webhooks/whatsapp` — Receives inbound messages, validates signature, queues for processing

**`services/whatsappService.js`**
- `processMessage(from, text)` — Main dispatcher:
  - Loads conversation history from `ConversationLog` model (last 10 turns for context)
  - Classifies intent: ORDER_STATUS | PRODUCT_QUERY | COMPLAINT | ESCALATION | OTHER
  - Routes to appropriate handler
- `handleOrderStatusQuery(from, text)` — Extracts order ID (regex/NER), queries `Order` model, returns structured status
- `handleEscalation(from, reason)` — Tags conversation as `escalated`, notifies human agent queue via webhook/Slack

**`services/ai/whatsappAiService.js`**
- Sends conversation history + user message to AI
- System prompt includes product catalogue summary, company policies, escalation triggers
- Instructs AI to respond in structured JSON: `{ intent, reply, shouldEscalate, escalationReason }`

**`models/ConversationLog.js`**
```
{ waId, direction (inbound/outbound), message, intent, timestamp, sessionId, escalated }
```

**Escalation Mechanism**
1. AI returns `shouldEscalate: true` (detects anger, legal threat, fraud suspicion)
2. OR user explicitly requests "human agent"
3. OR conversation > 5 turns without resolution
4. → Conversation flagged, human agent notified, bot sends handoff message

**Order Status Retrieval**
```js
// Pattern: extract order ID from user message
const orderId = extractOrderId(text); // regex: /ECO-\d{6}/
const order = await Order.findOne({ orderId }).populate('lineItems');
return formatOrderStatus(order); // returns human-readable status string
```

**Session Management**
- Sessions identified by WhatsApp ID (`waId`)
- Conversation context stored in DB (last 10 messages injected into every AI call)
- Sessions expire after 24h inactivity

---

## Production Checklist

- [x] Environment-based config (never hardcoded secrets)
- [x] Request correlation IDs (X-Request-ID header)
- [x] Rate limiting on all `/api/` routes
- [x] Helmet security headers
- [x] Centralised error handler with production message sanitisation
- [x] AI response validation before DB insertion
- [x] Retry mechanism with exponential back-off
- [x] Full AI prompt + response logging in `AiLog` collection
- [x] Budget verification runs against DB prices (never AI prices)
- [x] Graceful shutdown on SIGTERM/SIGINT
- [x] MongoDB connection pooling (maxPoolSize: 10)
- [x] Compound indexes for common query patterns
- [ ] Add Jest integration test suite
- [ ] Add Swagger/OpenAPI spec (`swagger-jsdoc`)
- [ ] Add Redis cache for frequently-fetched category lists
- [ ] Add Prometheus metrics endpoint
