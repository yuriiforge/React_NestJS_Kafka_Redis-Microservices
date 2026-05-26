import { JwtPayload } from 'jsonwebtoken';
import { Role } from '../enums/role.enum';

export interface CustomJwtPayload extends JwtPayload {
  userId: string;
  email: string;
  username: string;
  role: Role;
}
