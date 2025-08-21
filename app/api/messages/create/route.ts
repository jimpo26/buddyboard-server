import { groupMembers } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { createMessage } from "@/lib/messages";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"

export async function POST(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { topicId, content } = values

    if (!topicId || !content) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }
    // check if user is member of the group
    const isUserMember = await db.select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, user.id!), eq(groupMembers.groupId, topicId)))
        .limit(1)

    if (isUserMember.length === 0) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const message = await createMessage({
        topicId,
        userId: user.id!,
        content
    });

    return NextResponse.json({ success: true, message });
}