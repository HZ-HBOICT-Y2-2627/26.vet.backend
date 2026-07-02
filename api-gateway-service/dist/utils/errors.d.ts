import { GraphQLError } from 'graphql';
export declare class GraphQLErrorWithStatus extends GraphQLError {
    statusCode: number;
    constructor(message: string, statusCode?: number, originalError?: Error);
}
export declare const handleValidationError: (error: unknown) => never;
export declare const handleDatabaseError: (error: unknown) => never;
export declare const handleNotFoundError: (resource: string) => never;
//# sourceMappingURL=errors.d.ts.map