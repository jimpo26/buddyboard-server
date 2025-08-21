import crypto from 'crypto'

import { v4 as uuidv4 } from 'uuid'
import { getVerificationTokenByEmail } from "@/data/verification-token";
import { db } from "@/lib/db";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { NewPasswordResetToken, NewTwoFactorToken, NewVerificationToken, passwordResetToken, twoFactorToken, verificationTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const generateVerificationToken = async (email: string): Promise<NewVerificationToken> => {
    const token = uuidv4()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

    const existingToken = await getVerificationTokenByEmail(email)

    if (existingToken) {
        await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))
    }

    const newToken = await db.insert(verificationTokens).values({
        identifier: email,
        token,
        expires
    }).returning()

    return newToken[0]
}

export const generatePasswordResetToken = async (email: string): Promise<NewPasswordResetToken> => {
    const token = uuidv4()
    const expires = new Date(new Date().getTime() + 3600 * 1000) // 1 hour

    const existingToken = await getPasswordResetTokenByEmail(email)

    if (existingToken) {
        await db.delete(passwordResetToken).where(eq(passwordResetToken.email, email))
    }

    const newToken = await db.insert(passwordResetToken).values({
        email,
        token,
        expiresAt: expires,
        createdAt: new Date()
    }).returning()

    return newToken[0]
}

export const generateTwoFactorToken = async (email: string): Promise<NewTwoFactorToken> => {
    const token = crypto.randomInt(100_000, 1_000_000)
    const expires = new Date(new Date().getTime() + 5 * 60 * 1000) // 5 minutes

    const existingToken = await getTwoFactorTokenByEmail(email)
    if (existingToken) {
        await db.delete(twoFactorToken).where(eq(twoFactorToken.email, email))
    }

    const newToken = await db.insert(twoFactorToken).values({
        email,
        token: token.toString(),
        expiresAt: expires,
        createdAt: new Date()
    }).returning()

    return newToken[0]
}