import type { DefaultSession } from "next-auth";
import type { Plan, Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      plan: Plan;
    } & DefaultSession["user"];
  }

  interface User {
    role?: Role;
    plan?: Plan;
    /** Extend session when user checked "Remember me" */
    remember?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    plan?: Plan;
    remember?: boolean;
  }
}
