# AI Support Chat Agent

A mini AI-powered customer support chat widget built with Node.js, TypeScript, React, PostgreSQL, and Redis.

## Features

- 🤖 AI-powered chat responses using OpenAI GPT-3.5
- 💬 Real-time chat interface with typing indicators
- 💾 Persistent conversation history
- 🔄 Session management with localStorage
- 🎨 Responsive and modern UI design
- 🛡️ Input validation and error handling
- 📊 Conversation persistence in PostgreSQL
- ⚡ Redis caching support

## Tech Stack

**Backend:**
- Node.js + TypeScript
- Express.js
- PostgreSQL (with pg library)
- Redis (with redis library)
- OpenAI API integration
- Zod for validation

**Frontend:**
- React + TypeScript
- Axios for API calls
- CSS3 for styling
- Responsive design

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)
- OpenAI API key

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd ai-support-chat

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Setup

```bash
# Create PostgreSQL database
createdb ai_support_db

# The backend will automatically create the required tables when it starts
```

### 3. Environment Configuration

Create a `.env` file in the `backend` directory:

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/ai_support_db
REDIS_URL=redis://localhost:6379
OPENAI_API_KEY=your_openai_api_key_here
MAX_TOKENS=500
MAX_MESSAGE_LENGTH=1000
```

Replace `username` and `password` with your PostgreSQL credentials.

### 4. Start the Services

```bash
# Start PostgreSQL
pg_ctl -D /usr/local/var/postgres start

# Start Redis
redis-server

# Start the backend server
cd backend
npm run dev

# In a new terminal, start the frontend
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## API Endpoints

### POST /chat/message
Send a message to the AI support agent.

**Request Body:**
```json
{
  "message": "What's your return policy?",
  "sessionId": "optional-session-id"
}
```

**Response:**
```json
{
  "reply": "We offer a 30-day return policy...",
  "sessionId": "conversation-session-id"
}
```

### GET /chat/history/:sessionId
Get conversation history for a session.

**Response:**
```json
{
  "messages": [
    {
      "id": "message-id",
      "sender": "user",
      "text": "Hello",
      "timestamp": "2023-12-21T10:30:00Z"
    }
  ]
}
```

### GET /health
Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2023-12-21T10:30:00Z"
}
```

## Database Schema

### conversations
- `id` (UUID, Primary Key)
- `created_at` (Timestamp)
- `updated_at` (Timestamp)

### messages
- `id` (UUID, Primary Key)
- `conversation_id` (UUID, Foreign Key)
- `sender` (VARCHAR: 'user' | 'ai')
- `text` (TEXT)
- `timestamp` (Timestamp)

## AI Agent Knowledge Base

The AI agent is trained with information about:

- **Shipping Policy:**
  - Ships to USA, Canada, UK, and EU
  - Standard: 5-7 business days, Express: 2-3 business days
  - Free shipping over $50, $5.99 standard, $12.99 express

- **Return Policy:**
  - 30-day return policy
  - Items must be unused in original packaging
  - Refunds processed in 5-7 business days
  - Free return shipping for defective items

- **Support Hours:**
  - Mon-Fri: 9 AM - 6 PM EST
  - Sat: 10 AM - 4 PM EST
  - Sun: Closed

- **Products:**
  - Electronics, gadgets, tech accessories
  - 1-year warranty on all products
  - Price match guarantee

## Error Handling

The application includes comprehensive error handling for:

- Invalid API keys
- Rate limiting
- Network timeouts
- Database connection issues
- Input validation errors
- LLM API failures

## Development

### Running Tests

```bash
# Backend tests
cd backend
npm run test

# Frontend tests
cd frontend
npm test
```

### Linting and Type Checking

```bash
# Backend
cd backend
npm run lint
npm run typecheck

# Frontend
cd frontend
npm run lint
npm run typecheck
```

### Building for Production

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

## Deployment Considerations

- Set up environment variables securely
- Configure PostgreSQL and Redis for production
- Set up SSL/TLS certificates
- Configure rate limiting
- Set up monitoring and logging
- Configure backup strategies for the database

## Project Architecture

ai-support-chat/
├── backend/
│   ├── src/
│   │   ├── controllers/chatController.ts
│   │   ├── services/
│   │   │   ├── database.ts (PostgreSQL)
│   │   │   ├── cache.ts (Redis)
│   │   │   └── llm.ts (OpenAI)
│   │   ├── middleware/errorHandler.ts
│   │   ├── utils/validation.ts
│   │   └── types/index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── components/ChatWidget.tsx
│   │   ├── services/api.ts
│   │   ├── types/index.ts
│   │   └── App.tsx
│   ├── package.json
│   └── tsconfig.json
├── README.md
└── setup scripts