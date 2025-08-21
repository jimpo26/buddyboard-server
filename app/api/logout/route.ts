import { signOut } from "@/auth";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
    await signOut()
    const cookie = await cookies()
    cookie.delete("authjs.session-token")
    cookie.delete("__Secure-authjs.session-token")
    cookie.delete("authjs.csrf-token")
    cookie.delete("authjs.callback-url")
    return NextResponse.json({ success: "User logged out successfully" })
}