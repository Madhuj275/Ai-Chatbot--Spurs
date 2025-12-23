"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const chatController_1 = require("./controllers/chatController");
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = require("./services/database");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.post('/chat/message', chatController_1.sendMessage);
app.get('/chat/history/:sessionId', chatController_1.getConversationHistory);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// Initialize database and start server
async function startServer() {
    try {
        const databaseService = new database_1.DatabaseService();
        // Test database connection by creating a test conversation
        await databaseService.createConversation();
        console.log('Database initialized successfully');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
//# sourceMappingURL=server.js.map