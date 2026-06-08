import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../generated/prisma';

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}
