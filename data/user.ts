import { User, users } from "@/db/schema";
import {db} from "@/lib/db";
import { eq } from "drizzle-orm";

export const getUserByEmail = async (email: string): Promise<User | null> => {
    try {
        const x = await db.select().from(users).where(eq(users.email, email)).limit(1);
        return x[0] || null;
    } catch (error) {
        return null;
    }
}

export const getUserById = async (id: string): Promise<User | null> => {
    try {
        const x = await db.select().from(users).where(eq(users.id, id)).limit(1);
        return x[0] || null;
    } catch (error) {
        return null;
    }
}