import { verificationTokens } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const getVerificationTokenByToken = async (token: string): Promise<typeof verificationTokens.$inferSelect | null> => {
    try {
        const x = await db.select().from(verificationTokens).where(eq(verificationTokens.token, token)).limit(1);
        return x[0] || null;
    } catch (e) {
        return null
    }
}

export const getVerificationTokenByEmail = async (email: string): Promise<typeof verificationTokens.$inferSelect | null> => {
    try {
        const x = await db.select().from(verificationTokens).where(eq(verificationTokens.identifier, email)).limit(1);
        return x[0] || null;
    } catch {
        return null
    }
}