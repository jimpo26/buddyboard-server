import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { NextRequest, NextResponse } from "next/server";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const token = params.get("token");
    if (!token) {
        return NextResponse.json({ error: "Token does not exist" })
    }
    const existingToken = await getVerificationTokenByToken(token);

    if (!existingToken) {
        return NextResponse.json({ error: "Token does not exist" })
    }

    const hasExpired = existingToken.expires < new Date();

    if (hasExpired) {
        return NextResponse.json({ error: "Token has expired" })
    }

    const existingUser = await getUserByEmail(existingToken.identifier);
    if (!existingUser) {
        return NextResponse.json({ error: "Email does not exist" })
    }

    await db.update(users).set({
        emailVerified: new Date(),
        email: existingToken.identifier
    }).where(eq(users.email, existingToken.identifier))

    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, existingToken.identifier))
    return NextResponse.json({ success: "Email verified" })
}