"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.asyncHandler = void 0;
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
exports.asyncHandler = asyncHandler;
const errorHandler = (err, _req, res, _next) => {
    const message = err instanceof Error ? err.message : 'An unexpected error occurred';
    res.status(500).json({ error: message });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandling.js.map