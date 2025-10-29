import { topics } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { editTopic } from "@/lib/topics";
import { CreateTopicSchema } from "@/schemas/topics";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"

export async function PATCH(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { topicId, data } = values
    const validatedFields = CreateTopicSchema.safeParse(data);

    if (!validatedFields.success || !topicId) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const isUserProprietary = await db.select()
        .from(topics)
        .where(and(eq(topics.id, topicId), eq(topics.createdById, user.id!)))
        .limit(1)

    if (isUserProprietary.length === 0) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const topic = await editTopic(validatedFields.data, topicId);

    return NextResponse.json({ success: true, topic });
}