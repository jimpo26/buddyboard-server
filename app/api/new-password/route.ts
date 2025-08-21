import { db } from "@/lib/db";
import { getUserByEmail } from "@/data/user";
import { NewPasswordSchema } from "@/schemas";
import { getPasswordResetTokenByToken } from "@/data/password-reset-token";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { passwordResetToken, users } from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const values = await request.json();
    const validatedFields = NewPasswordSchema.safeParse(values);
    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const { password } = validatedFields.data;

    const existingToken = await getPasswordResetTokenByToken(values.token);
    if (!existingToken) {
        return NextResponse.json({ error: "Invalid token!" })
    }

    const hasExpired = existingToken.expires < new Date();
    if (hasExpired) {
        return NextResponse.json({ error: "Token has expired!" })
    }

    const existingUser = await getUserByEmail(existingToken.email);
    if (!existingUser) {
        return NextResponse.json({ error: "Email does not exist!" })
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users).set({
        password: hashedPassword
    }).where(eq(users.email, existingToken.email))

    await db.delete(passwordResetToken).where(eq(passwordResetToken.email, existingToken.email))
    return NextResponse.json({ success: "Password updated!" })
}