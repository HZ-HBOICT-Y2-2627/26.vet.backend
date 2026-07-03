import { Request, Response, NextFunction } from 'express';

export const requestLogger = (req: Request, _res: Response, next: NextFunction) => {
  console.log(`${req.method} ${req.originalUrl} - ${req.headers['user-agent']}`);
  next();
};
