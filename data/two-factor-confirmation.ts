import {db} from "@/lib/db";
import { twoFactorConfirmations } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getTwoFactorConfirmationByUserId = async (userId: string) => {
    try{
        return await db.select().from(twoFactorConfirmations).where(eq(twoFactorConfirmations.userId, userId)).limit(1)
    } catch {
        return null
    }
}
