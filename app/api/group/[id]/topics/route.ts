import { db } from "@/lib/db";
import { groupMembers, topics } from "@/db/schema";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const groupId = (await params).id;
        if (!groupId) {
            return NextResponse.json({ error: "Group ID is required" }, { status: 400 });
        }

        //check if user is in the group
        const groupMember = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, user.id!)))
            .limit(1);

        if (groupMember.length === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Get all topics for the group
        const groupTopics = await db
            .select()
            .from(topics)
            .where(eq(topics.groupId, groupId))
            .orderBy(topics.name);
        return NextResponse.json({
            success: true,
            topics: groupTopics
        });
    } catch (error) {
        console.error("[GROUP_TOPICS_GET]", error);
        return NextResponse.json(
            { error: "Failed to fetch group topics" },
            { status: 500 }
        );
    }
}
