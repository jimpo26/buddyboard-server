import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { groupMembers, messages, topics } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { and, eq } from "drizzle-orm";
import { sendMessageNotification } from "@/lib/push-notifications";

// Validation schema for message creation
const SendMessageSchema = z.object({
    content: z.string().min(1, "Message content is required"),
    topicId: z.string().uuid("Invalid topic ID format"),
    optimisticTempId: z.string().optional()
});

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const values = await request.json();
        const validatedFields = SendMessageSchema.safeParse(values);

        if (!validatedFields.success) {
            return NextResponse.json({
                success: false,
                error: "Invalid fields!"
            }, { status: 400 });
        }

        const { content, topicId, optimisticTempId } = validatedFields.data;

        //check if topicId has a groupId where the user is in
        const groupMember = await db.select()
            .from(groupMembers)
            .innerJoin(topics, eq(groupMembers.groupId, topics.groupId))
            .where(and(eq(topics.id, topicId), eq(groupMembers.userId, user.id!)))
            .limit(1);

        if (groupMember.length === 0) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Create the new message
        const [message] = await db
            .insert(messages)
            .values({
                userId: user.id!,
                topicId,
                content,
            })
            .returning();

        // Fetch the user info to include in response
        const userName = user.name;
        const userEmail = user.email;
        // Send push notifications to group members (async)
        try {
            // Don't await this to avoid delaying the response
            sendMessageNotification({
                topicId,
                groupId: groupMember[0].topics.groupId,
                senderId: user.id!,
                senderName: userName || user.email!,
                messageContent: content
            }).catch(error => {
                console.error("[PUSH_NOTIFICATION_ERROR]", error);
            });
        } catch (error) {
            // Log error but don't fail the request
            console.error("[PUSH_NOTIFICATION_ERROR]", error);
        }

        // Return the newly created message with user info
        return NextResponse.json({
            success: true,
            message: {
                ...message,
                userName,
                userEmail,
                tempId: optimisticTempId
            }
        });
    } catch (error) {
        console.error("[MESSAGE_SEND]", error);
        return NextResponse.json({
            success: false,
            error: "Failed to send message"
        }, { status: 500 });
    }
}
