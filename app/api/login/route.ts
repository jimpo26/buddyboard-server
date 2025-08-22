import { encode } from "next-auth/jwt";
import { LoginSchema } from "@/schemas";
import { AuthError } from "next-auth";
import { getUserByEmail } from "@/data/user";
import { generateTwoFactorToken, generateVerificationToken } from "@/lib/tokens";
import { sendTwoFactorTokenEmail, sendVerificationEmail } from "@/lib/mail";
import bcrypt from "bcryptjs";
import { getTwoFactorTokenByEmail } from "@/data/two-factor-token";
import { db } from "@/lib/db";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { eq } from "drizzle-orm";
import { twoFactorConfirmations, twoFactorToken } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const values = await request.json();
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const { email, password, code } = validatedFields.data

    const existingUser = await getUserByEmail(email)

    if (!existingUser || !existingUser.email || !existingUser.password || !bcrypt.compareSync(password, existingUser.password)) {
        return NextResponse.json({ error: "Invalid credentials!" })
    }

    if (!existingUser.emailVerified) {
        const verificationToken = await generateVerificationToken(existingUser.email);
        await sendVerificationEmail(verificationToken.identifier, verificationToken.token);
        return NextResponse.json({ success: "Confirmation email sent!" })
    }

    if (existingUser.isTwoFactorEnabled && existingUser.email) {
        if (code) {
            const twoFAToken = await getTwoFactorTokenByEmail(existingUser.email)
            if (!twoFAToken || twoFAToken.token !== code) {
                return NextResponse.json({ error: "Invalid code!", twoFactor: true })
            }

            const hasExpired = twoFAToken.expiresAt < new Date()
            if (hasExpired) {
                return NextResponse.json({ error: "Code has expired!", twoFactor: true })
            }

            await db.delete(twoFactorToken).where(eq(twoFactorToken.email, existingUser.email))

            const existingConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
            if (existingConfirmation) {
                await db.delete(twoFactorConfirmations).where(eq(twoFactorConfirmations.userId, existingUser.id))
            }

            await db.insert(twoFactorConfirmations).values({
                userId: existingUser.id
            }).returning()
        } else {
            const twoFactorToken = await generateTwoFactorToken(existingUser.email)
            await sendTwoFactorTokenEmail(twoFactorToken.email, twoFactorToken.token);

            return NextResponse.json({ twoFactor: true })
        }
    }

    try {
        const token = await encode({
            token: { sub: existingUser.id.toString(), name: existingUser.name, iat: Date.now(), exp: Date.now() + 60 * 60 * 24 * 30, email: existingUser.email, image: existingUser.image },
            secret: process.env.NEXTAUTH_SECRET || "",
            salt: process.env.NODE_ENV === "development" ? "authjs.session-token" : "authjs.session-token",
            maxAge: 60 * 60 * 24 * 30,
        });
        /*const cookie = await cookies()
        cookie.set("authjs.session-token", token)*/

        return NextResponse.json({
            success: true,
            token,
            user: { id: existingUser.id, email: existingUser.email, name: existingUser.name, image: existingUser.image },
        });
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return NextResponse.json({ error: "Invalid credentials!" })
                default:
                    return NextResponse.json({ error: "Something went wrong!" })
            }
        }

        return NextResponse.json({ error: "Something went wrong!" })
        throw error
    }
}