import { cookies, headers } from "next/headers"
import { redirect } from "next/navigation"
import { currentUser } from "@/lib/auth"
import { getUserByEmail, getUserById } from "@/data/user"
import { db } from "@/lib/db"
import { users } from "@/db/schema"
import { encode } from "next-auth/jwt";

export default async function Testing() {

    const user = await currentUser()
    const headersList = await cookies()
    const jwt = headersList.get("authjs.session-token") || headersList.get("__Secure-authjs.session-token")
    if (!user || !jwt) return <div>
        <p>It seems you are not logged in. Please try again.</p>
    </div>

    let existingUser = await getUserByEmail(user.email!)
    if (!existingUser) {
        const usr = await db.insert(users).values({
            id: user.id!,
            email: user.email!,
            name: user.name!,
            //image: user.image,
            emailVerified: new Date(),
            isTwoFactorEnabled: false,
        }).returning()
        existingUser = usr[0]
    }
    const token = await encode({
        token: { sub: existingUser.id.toString(), name: existingUser.name, iat: Date.now(), exp: Date.now() + 60 * 60 * 24 * 30, email: existingUser.email, image: existingUser.image },
        secret: process.env.NEXTAUTH_SECRET || "",
        salt: process.env.NODE_ENV === "development" ? "authjs.session-token" : "authjs.session-token",
        maxAge: 60 * 60 * 24 * 30,
    });
    return redirect(`exp://--/auth/login?jwt=${token}&user=${encodeURIComponent(JSON.stringify(existingUser))}`)
}
