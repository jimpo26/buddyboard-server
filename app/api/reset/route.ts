import {ResetSchema} from "@/schemas";
import {getUserByEmail} from "@/data/user";
import {generatePasswordResetToken} from "@/lib/tokens";
import {sendPasswordResetEmail} from "@/lib/mail";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    const values = await request.json();
    const validatedFields = ResetSchema.safeParse(values);

    if (!validatedFields.success) {
        return NextResponse.json({ error: "Invalid email!"})
    }

    const { email } = validatedFields.data

    const existingUser = await getUserByEmail(email)
    if(existingUser) {
        const passwordResetToken = await generatePasswordResetToken(email)
        await sendPasswordResetEmail(passwordResetToken.email, passwordResetToken.token)
    }
    return NextResponse.json({ success: "If email exists, a reset email has been sent!"})
}