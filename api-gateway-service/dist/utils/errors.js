"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleNotFoundError = exports.handleDatabaseError = exports.handleValidationError = exports.GraphQLErrorWithStatus = void 0;
const graphql_1 = require("graphql");
class GraphQLErrorWithStatus extends graphql_1.GraphQLError {
    constructor(message, statusCode = 400, originalError) {
        super(message, {
            originalError,
        });
        this.statusCode = statusCode;
    }
}
exports.GraphQLErrorWithStatus = GraphQLErrorWithStatus;
const handleValidationError = (error) => {
    if (error instanceof Error) {
        throw new GraphQLErrorWithStatus(error.message, 400, error);
    }
    throw new GraphQLErrorWithStatus('An unexpected error occurred', 500);
};
exports.handleValidationError = handleValidationError;
const handleDatabaseError = (error) => {
    if (error instanceof Error) {
        const message = error.message || 'Database operation failed';
        throw new GraphQLErrorWithStatus(message, 500, error);
    }
    throw new GraphQLErrorWithStatus('Database operation failed', 500);
};
exports.handleDatabaseError = handleDatabaseError;
const handleNotFoundError = (resource) => {
    throw new GraphQLErrorWithStatus(`${resource} not found`, 404);
};
exports.handleNotFoundError = handleNotFoundError;
//# sourceMappingURL=errors.js.map