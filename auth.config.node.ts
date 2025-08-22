import bcrypt from "bcryptjs";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";

import { LoginSchema } from "./schemas";
import { getUserByEmail } from "@/data/user";

export const authOptions = {
    providers: [
        Apple({
            clientId: process.env.APPLE_CLIENT_ID,
            clientSecret: process.env.APPLE_CLIENT_SECRET,
        }),
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
        Credentials({
            async authorize(credentials) {
                const validatedFields = LoginSchema.safeParse(credentials);
                if (validatedFields.success) {
                    const { email, password } = validatedFields.data;
                    const user = await getUserByEmail(email);
                    if (!user || !user.password) return null;

                    const passwordMatches = await bcrypt.compare(password, user.password);
                    if (passwordMatches) return user;
                }
                return null;
            },
        }),
    ],
};
