import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pushTokens } from "@/db/schema";
import { eq, ne, and } from "drizzle-orm";

// Define validation schema for push token registration
const RegisterTokenSchema = z.object({
    token: z.string().min(1, "Token is required"),
    deviceId: z.string().min(1, "Device ID is required"),
    deviceName: z.string().optional(),
    deviceType: z.string().optional()
});

export async function POST(request: Request): Promise<NextResponse> {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const values = await request.json();
        const validatedFields = RegisterTokenSchema.safeParse(values);

        if (!validatedFields.success) {
            return NextResponse.json({
                success: false,
                error: "Invalid fields!"
            }, { status: 400 });
        }

        const { token, deviceId, deviceName, deviceType } = validatedFields.data;

        const existingTokenOnDeviceAndUser = await db.select()
            .from(pushTokens)
            .where(and(
                eq(pushTokens.deviceId, deviceId),
                eq(pushTokens.token, token),
                eq(pushTokens.userId, user.id!)
            ))
            .limit(1);

        if (existingTokenOnDeviceAndUser.length > 0) {
            return NextResponse.json({
                success: true,
                message: "No action"
            }, { status: 200 });
        }

        // First, deactivate any existing tokens for this device from other users
        // (since device can only have one active user at a time)
        const deletedTokens = await db.delete(pushTokens)
            .where(and(
                eq(pushTokens.deviceId, deviceId),
                eq(pushTokens.token, token),
                ne(pushTokens.userId, user.id!)
            )).returning();

        // Upsert the token for this user + device combination
        const [upsertedToken] = await db
            .insert(pushTokens)
            .values({
                userId: user.id!,
                token,
                deviceId,
                deviceName,
                deviceType,
                isActive: true
            })
            .onConflictDoUpdate({
                target: [pushTokens.userId, pushTokens.deviceId], // This matches your unique index
                set: {
                    token,
                    deviceName,
                    deviceType,
                    isActive: true,
                    updatedAt: new Date()
                }
            })
            .returning();

        return NextResponse.json({
            success: true,
            message: upsertedToken.createdAt === upsertedToken.updatedAt
                ? "Push token registered"
                : "Push token updated",
            token: upsertedToken.id
        });
    } catch (error) {
        console.error("[PUSH_TOKEN_REGISTER]", error);
        return NextResponse.json({
            success: false,
            error: "Failed to register push token"
        }, { status: 500 });
    }
}
