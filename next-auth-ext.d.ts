import NextAuth, { type DefaultSession } from "next-auth"

export type ExtendedUser = DefaultSession["user"] & {
    isTwoFactorEnabled: boolean
    isOAuth: boolean
    emailVerified: Date
}

declare module "next-auth" {
    interface Session {
        user: {
            isTwoFactorEnabled: boolean,
            isOAuth: boolean,
            emailVerified: Date
        } & DefaultSession["user"]
    }

    interface JWT {
        isTwoFactorEnabled?: boolean
    }
}
