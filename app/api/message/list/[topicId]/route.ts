import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, users } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { eq, desc, lt, and } from "drizzle-orm";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ topicId: string }> }
): Promise<NextResponse> {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const { topicId } = await params;
        const url = new URL(request.url);
        const limit = parseInt(url.searchParams.get("limit") || "50");
        const cursor = url.searchParams.get("cursor");

        // Validate inputs
        if (!topicId) {
            return NextResponse.json({ success: false, error: "Topic ID is required" }, { status: 400 });
        }

        // Base query to get messages for the topic, ordered by newest first
        let query = null
        if (!cursor) {
            query = db
                .select({
                    id: messages.id,
                    userId: messages.userId,
                    topicId: messages.topicId,
                    content: messages.content,
                    createdAt: messages.createdAt,
                    updatedAt: messages.updatedAt,
                    userName: users.name,
                    userEmail: users.email,
                })
                .from(messages)
                .leftJoin(users, eq(messages.userId, users.id))
                .where(eq(messages.topicId, topicId))
                .orderBy(desc(messages.createdAt))
                .limit(limit + 1); // Get one extra to check if there are more
        } else {
            // If cursor provided, get messages older than the cursor
            // Assume cursor is an ISO date string of the oldest message already loaded
            query = db
                .select({
                    id: messages.id,
                    userId: messages.userId,
                    topicId: messages.topicId,
                    content: messages.content,
                    createdAt: messages.createdAt,
                    updatedAt: messages.updatedAt,
                    userName: users.name,
                    userEmail: users.email,
                })
                .from(messages)
                .leftJoin(users, eq(messages.userId, users.id))
                .where(and(eq(messages.topicId, topicId), lt(messages.createdAt, new Date(cursor))))
                .orderBy(desc(messages.createdAt))
                .limit(limit + 1);
        }

        // Execute query
        const results = await query;

        // Check if there are more messages
        const hasMore = results.length > limit;

        // Remove the extra message if we got one
        const messagesList = hasMore ? results.slice(0, limit) : results;

        // Get the next cursor if there are more results
        const nextCursor = hasMore && messagesList.length > 0
            ? messagesList[messagesList.length - 1].createdAt.toISOString()
            : undefined;

        return NextResponse.json({
            success: true,
            messages: messagesList,
            hasMore,
            nextCursor,
        });
    } catch (error) {
        console.error("[MESSAGE_LIST_GET]", error);
        return NextResponse.json({
            success: false,
            error: "Failed to retrieve messages",
            messages: [],
            hasMore: false
        }, { status: 500 });
    }
}
