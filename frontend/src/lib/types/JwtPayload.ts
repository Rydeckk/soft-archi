import { UserRole } from "@/lib/enums/UserRole";

export type JWTPaylod = {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
};
