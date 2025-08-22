import { getUserByEmail } from "@/data/user";
import { users } from "@/db/schema";
import { db } from "@/lib/db";
import { sendVerificationEmail } from "@/lib/mail";
import { generateVerificationToken } from "@/lib/tokens";
import { RegisterSchema } from "@/schemas";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const runtime = 'nodejs'

export async function POST(request: Request) {
    const values = await request.json();
    const validatedFields = RegisterSchema.safeParse(values);
    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const { email, password, name } = validatedFields.data;
    //const hashedPassword = Crypto.subtle.digest('SHA-256', password);
    const hashedPassword = await bcrypt.hash(password, 10);

    const existingUser = await getUserByEmail(email)

    if (existingUser) {
        return NextResponse.json({ error: "Email already in use!" });
    }

    const user = await db.insert(users).values({
        email,
        password: hashedPassword,
        name
    }).returning();
    console.log(user)
    if (!user) {
        return NextResponse.json({ error: "Failed to create user!" });
    }

    const verificationToken = await generateVerificationToken(email);
    await sendVerificationEmail(verificationToken.identifier, verificationToken.token);

    return NextResponse.json({ success: "Confirmation email sent!" });
}