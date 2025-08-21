// app/api/auth/[...nextauth]/route.ts
import NextAuth from "next-auth";
import nodeAuthConfig from "@/auth.config.node";

const handler = NextAuth(nodeAuthConfig);

export { handler as GET, handler as POST };
