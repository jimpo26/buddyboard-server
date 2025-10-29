import { messages } from "@/db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export async function createMessage(messageData: {
    topicId: string;
    userId: string;
    content?: string;
    metadata?: any;
}) {
    const [newMessage] = await db.insert(messages).values(messageData).returning();
    return newMessage;
}


export async function getMessages(topicId: string, limit = 50, offset = 0) {
    const msgs = await db.select()
                        .from(messages)
                        .where(eq(messages.topicId, topicId))
                        .limit(limit)
                        .offset(offset);
    return msgs;
}
