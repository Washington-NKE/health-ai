import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

export default NextAuth(authConfig).auth;

export const config = {
  // Match all request paths except for the ones starting with:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - favicon.ico (favicon file)
  // - public folder images (svg, png, jpg, jpeg)
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$).*)",
  ],
};
