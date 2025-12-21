# AI Support Chat Agent - Setup Script
# This script helps you get started quickly

echo "🚀 Setting up AI Support Chat Agent..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if PostgreSQL is running
if ! pg_isready -h localhost -p 5432 &> /dev/null; then
    echo "⚠️  PostgreSQL is not running. Please start PostgreSQL first."
    echo "   You can install PostgreSQL from: https://www.postgresql.org/download/"
fi

# Check if Redis is running
if ! redis-cli ping &> /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis first."
    echo "   You can install Redis from: https://redis.io/download"
fi

echo "📦 Installing dependencies..."

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install

echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your environment variables in backend/.env"
echo "2. Start PostgreSQL and Redis"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'npm start' in the frontend directory"
echo ""
echo "🔑 Don't forget to add your OpenAI API key to the .env file!"