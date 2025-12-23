"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateChatRequest = validateChatRequest;
exports.sanitizeMessage = sanitizeMessage;
const zod_1 = require("zod");
const chatRequestSchema = zod_1.z.object({
    message: zod_1.z.string().min(1, 'Message cannot be empty').max(1000, 'Message too long'),
    sessionId: zod_1.z.string().uuid().optional(),
});
function validateChatRequest(data) {
    return chatRequestSchema.parse(data);
}
function sanitizeMessage(message) {
    return message.trim().replace(/[<>]/g, '');
}
//# sourceMappingURL=validation.js.map