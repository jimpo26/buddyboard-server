// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import authConfig from "@/auth.config.node";

const handler = NextAuth(authConfig);

export const GET = handler.handlers.GET;
export const POST = handler.handlers.POST;