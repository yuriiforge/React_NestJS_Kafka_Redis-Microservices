import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { Role } from '@ecommerce/shared';

interface CustomJwtPayload extends jwt.JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export function jwtMiddleware(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET!,
    ) as CustomJwtPayload;
    req.headers['x-user-id'] = payload.userId;
    req.headers['x-user-role'] = payload.role;
    req.headers['x-user-email'] = payload.email;
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
