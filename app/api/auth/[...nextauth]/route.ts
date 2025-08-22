// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import { authOptions } from "@/auth.config.node";

const handler = NextAuth(authOptions);

export const GET = handler.handlers.GET;
export const POST = handler.handlers.POST;