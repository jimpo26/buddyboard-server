import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { messages } from "@/db/schema";
import { currentUser } from "@/lib/auth";

// Validation schema for message creation
const SendMessageSchema = z.object({
    content: z.string().min(1, "Message content is required"),
    topicId: z.string().uuid("Invalid topic ID format")
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

        const { content, topicId } = validatedFields.data;

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

        // Return the newly created message with user info
        return NextResponse.json({
            success: true,
            message: {
                ...message,
                userName,
                userEmail
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
