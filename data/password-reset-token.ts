import { passwordResetToken } from "@/db/schema";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";

export const getPasswordResetTokenByToken = async (token: string) => {
    try {
        return await db.select().from(passwordResetToken).where(eq(passwordResetToken.token, token)).limit(1);
    } catch {
        return null
    }
}

export const getPasswordResetTokenByEmail = async (email: string) => {
    try {
        return await db.select().from(passwordResetToken).where(eq(passwordResetToken.email, email)).limit(1);
    } catch {
        return null
    }
}