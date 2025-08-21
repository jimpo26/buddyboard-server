"use server"

import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { getVerificationTokenByToken } from "@/data/verification-token";
import { users, verificationTokens } from "@/db/schema";
import { eq } from "drizzle-orm";

export const newVerification = async (token: string) => {
    const existingToken = await getVerificationTokenByToken(token);
    if (!existingToken) {
        return { error: "Token does not exist" }
    }

    const hasExpired = existingToken.expires < new Date();

    if (hasExpired) {
        return { error: "Token has expired" }
    }

    const existingUser = await getUserByEmail(existingToken.identifier);

    if (!existingUser) {
        return { error: "Email does not exist" }
    }

    await db.update(users).set({
        emailVerified: new Date(),
        email: existingToken.identifier
    }).where(eq(users.email, existingToken.identifier))

    await db.delete(verificationTokens).where(eq(verificationTokens.identifier, existingToken.identifier))
    return { success: "Email verified" }
}