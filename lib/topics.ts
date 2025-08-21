import { CreateTopicSchema } from "@/schemas/topics";
import z from "zod";
import { db } from "./db";
import { topics } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function createTopic(values: z.infer<typeof CreateTopicSchema>, groupId: string, userId: string) {
    const topic = await db.insert(topics).values({
        ...values,
        groupId,
        createdById: userId,
    }).returning();

    return topic;
}

export async function editTopic(values: z.infer<typeof CreateTopicSchema>, topicId: string) {
    const topic = await db.update(topics).set({
        ...values,
    }).where(eq(topics.id, topicId)).returning();

    return topic;
}

export async function deleteTopic(topicId: string) {
    const topic = await db.delete(topics).where(eq(topics.id, topicId)).returning();

    return topic;
}