# AI Support Chat Agent - Quick Start (Windows)
# This script helps you get started quickly on Windows

echo "🚀 Setting up AI Support Chat Agent..."

# Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo "📦 Installing dependencies..."

# Install backend dependencies
cd backend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install backend dependencies
    exit /b 1
)

# Install frontend dependencies
cd ../frontend
call npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install frontend dependencies
    exit /b 1
)

echo "✅ Dependencies installed successfully!"
echo ""
echo "📝 Next steps:"
echo "1. Set up your environment variables in backend\.env"
echo "2. Start PostgreSQL and Redis"
echo "3. Run 'npm run dev' in the backend directory"
echo "4. Run 'npm start' in the frontend directory"
echo ""
echo "🔑 Don't forget to add your OpenAI API key to the .env file!"
echo ""
echo "⚠️  Note: Make sure PostgreSQL and Redis are running before starting the application."
pause