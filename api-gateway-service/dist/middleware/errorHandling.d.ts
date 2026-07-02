import { Request, Response, NextFunction, RequestHandler } from 'express';
export declare const asyncHandler: (fn: RequestHandler) => RequestHandler;
export declare const errorHandler: (err: unknown, _req: Request, res: Response, _next: NextFunction) => void;
//# sourceMappingURL=errorHandling.d.ts.map