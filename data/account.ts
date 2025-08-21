import {db} from "@/lib/db";
import { accounts } from "@/db/schema";
import { eq } from "drizzle-orm";

export const getAccountByUserId = async (userId: string) => {
    try {
        return db.select().from(accounts).where(eq(accounts.userId, userId)).limit(1)
    } catch (error) {
        return null
    }
}