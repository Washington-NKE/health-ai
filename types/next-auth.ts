import NextAuth, { DefaultSession } from "next-auth"
import { UserRole } from "@prisma/client"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      // optional role propagated from our Prisma user model
      role?: UserRole
    } & DefaultSession["user"]
  }

  // You can also extend the User interface if you use it directly
  interface User {
    role?: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: UserRole
    id: string
  }
}