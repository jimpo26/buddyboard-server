import { groupMembers } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { getMessages } from "@/lib/messages";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"

export async function GET(request: Request, { params }: { params: { topicId: string } }): Promise<NextResponse> {
    const { topicId } = params

    if (!topicId) {
        return NextResponse.json({ error: "Invalid fields!" })
    }
    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const isUserMember = await db.select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, user.id!), eq(groupMembers.groupId, topicId)))
        .limit(1)

    if (isUserMember.length === 0) {
        return NextResponse.json({ error: "Unauthorized!" })
    }
    const messages = await getMessages(topicId);

    return NextResponse.json({ success: true, messages });
}