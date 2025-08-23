import NextAuth from "next-auth"
import { DrizzleAdapter } from "@auth/drizzle-adapter"

import { db } from "@/lib/db";
import authConfig from "@/auth.config.edge";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "@/data/two-factor-confirmation";
import { getAccountByUserId } from "@/data/account";
import { twoFactorConfirmations, users } from "./db/schema";
import { eq } from "drizzle-orm";
import { getToken } from "next-auth/jwt";

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut
} = NextAuth({
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: "/auth/login",
        error: "/auth/error",
    },
    events: {
        async linkAccount({ user }) {
            if (!user.id) return
            await db.update(users)
                .set({ emailVerified: new Date() })
                .where(eq(users.id, user.id))
                .returning()
        },

    },
    callbacks: {
        async signIn({ user, account }) {
            // Allow OAuth without email verification
            if (account?.provider !== "credentials") return true

            const existingUser = await getUserById(user.id!)

            if (!existingUser?.emailVerified) return false

            if (existingUser.isTwoFactorEnabled) {
                const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(existingUser.id)
                if (!twoFactorConfirmation) return false

                // Delete two factor confirmation for next login
                await db.delete(twoFactorConfirmations)
                    .where(eq(twoFactorConfirmations.userId, existingUser.id))
            }
            return true
        },
        async session({ token, session }) {
            if (token.sub && session.user) {
                session.user.id = token.sub
            }

            if (session.user) {
                session.user.isTwoFactorEnabled = token.isTwoFactorEnabled as boolean
                session.user.name = token.name
                session.user.email = token.email!
                session.user.isOAuth = token.isOAuth as boolean
                session.user.emailVerified = token.emailVerified as Date
            }
            return session;
        },
        async jwt({ token }) {
            if (!token.sub) return token // not logged in

            const existingUser = await getUserById(token.sub)

            if (!existingUser) return token // user not found

            const existingAccount = await getAccountByUserId(
                existingUser.id
            )

            token.isOAuth = !!existingAccount

            token.name = existingUser.name
            token.email = existingUser.email
            token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled
            token.emailVerified = existingUser.emailVerified

            return token
        },
    },
    adapter: DrizzleAdapter(db),
    session: { strategy: "jwt" },
    useSecureCookies: false,
    ...authConfig
})