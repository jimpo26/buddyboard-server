import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, response: Response) {
    // print the request, and body
    const cookie = await cookies()
    const session = cookie.get("authjs.session-token") || cookie.get("__Secure-authjs.session-token")
    if (!session) {
        return NextResponse.redirect(new URL("/google", request.url))
    }
    return NextResponse.redirect(new URL("buddyboard://login?token=" + session.value, request.url))
}
