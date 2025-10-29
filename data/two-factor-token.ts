import { twoFactorToken, TwoFactorToken } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const getTwoFactorTokenByToken = async (token: string) => {
    try {
        return await db.select().from(twoFactorToken).where(eq(twoFactorToken.token, token))
    } catch {
        return null
    }
}

export const getTwoFactorTokenByEmail = async (email: string): Promise<TwoFactorToken | null> => {
    try {
        const tkn = await db.select().from(twoFactorToken).where(eq(twoFactorToken.email, email)).limit(1)
        return tkn[0] || null
    } catch {
        return null
    }
}