import { groups, topics } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { deleteTopic } from "@/lib/topics";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { topicId } = values

    if (!topicId) {
        return NextResponse.json({ error: "Invalid fields!" })
    }
    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }
    
    const isUserProprietary = await db.select()
        .from(groups)
        .innerJoin(topics, eq(groups.id, topics.groupId))
        .where(and(eq(topics.id, topicId), eq(groups.proprietaryUserId, user.id!)))
        .limit(1)

    if (isUserProprietary.length === 0) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const topic = await deleteTopic(topicId);

    return NextResponse.json({ success: true, topic });
}