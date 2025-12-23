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
git clone https://github.com/Madhuj275/Ai-Chatbot--Spurs
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


### Database Setup and Migrations

```bash
# Create PostgreSQL database
# Option 1: Using psql
psql -U postgres -c "CREATE DATABASE ai_support_db;"

# Option 2: Using createdb command
createdb ai_support_db

### 4. Running the Application

# Terminal 1: Start Backend
cd backend
npm install
npm run dev

# Terminal 2: Start Frontend
cd frontend
npm install
npm start

```

## Architecture Overview

### Backend Architecture (Layered Architecture)

```
backend/
├── src/
│   ├── controllers/          # HTTP request handlers
│   │   └── chatController.ts # Chat endpoint logic
│   ├── services/            # Business logic layer
│   │   ├── chatService.ts   # Chat orchestration
│   │   ├── llmService.ts    # LLM provider abstraction
│   │   └── cacheService.ts  # Redis caching logic
│   ├── repositories/        # Data access layer
│   │   ├── conversationRepository.ts
│   │   └── messageRepository.ts
│   ├── models/            # Data models and types
│   ├── middleware/        # Express middleware
│   ├── config/           # Configuration management
│   └── utils/            # Utility functions
└── tests/                # Unit and integration tests
```

### Key Design Decisions

1. **Layered Architecture**: Separation of concerns with distinct layers for HTTP handling, business logic, and data access
2. **Repository Pattern**: Abstracts database operations for easier testing and future database migrations
3. **Service Layer**: Contains all business logic, keeping controllers thin and focused on HTTP concerns
4. **LLM Provider Abstraction**: `llmService.ts` provides a unified interface for multiple AI providers (OpenAI, Anthropic)
5. **Caching Strategy**: Redis caching for frequently accessed conversation history
6. **Validation Layer**: Zod schemas for runtime type validation and API contract enforcement

### Frontend Architecture

```
frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ChatWidget.tsx    # Main chat interface
│   │   ├── MessageList.tsx   # Message display
│   │   └── InputForm.tsx     # User input handling
│   ├── services/         # API communication
│   │   └── api.ts        # Backend API client
│   ├── hooks/           # Custom React hooks
│   ├── utils/           # Frontend utilities
│   └── types/           # TypeScript type definitions
```

### Provider Used
- **Primary**: OpenAI GPT-3.5-turbo
- **Secondary**: Anthropic Claude (ready for integration)
- **Architecture**: Provider-agnostic service layer for easy switching


### Trade-offs and Design Decisions

1. **Simple vs. Scalable**: Chose simple layered architecture over microservices for faster development
2. **Cost vs. Quality**: Using GPT-3.5 instead of GPT-4 for cost efficiency
3. **Speed vs. Accuracy**: Limited conversation history to prevent token explosion
4. **Features vs. Time**: Focused on core chat functionality, advanced features deferred

## If I Had More Time...Immediate Improvements

1. **Authentication & User Management**: Add user accounts and personalized experiences
2. **Admin Dashboard**: Web interface for viewing conversations and analytics
3. **File Upload Support**: Allow users to share images of products/issues
4. **Multi-language Support**: Internationalization for global users
5. **WebSocket Real-time Updates**: Replace polling with WebSocket connections


