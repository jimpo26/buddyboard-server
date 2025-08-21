import {db} from "@/lib/db";
import {TwoFactorToken} from "@prisma/client";

export const getTwoFactorTokenByToken = async (token: string) => {
    try{
        return await db.twoFactorToken.findUnique({
            where: { token }
        })
    } catch {
        return null
    }
}

export const getTwoFactorTokenByEmail = async (email: string): Promise<TwoFactorToken | null> => {
    try{
        return await db.twoFactorToken.findFirst({
            where: { email }
        })
    } catch {
        return null
    }
}