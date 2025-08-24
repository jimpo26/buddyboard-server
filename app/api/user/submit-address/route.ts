import { giftRedemptions, groupMembers } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

// Schema for address validation
const addressSchema = z.object({
    fullName: z.string().min(2, "Full name is required"),
    streetAddress: z.string().min(2, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().min(2, "State/Province is required"),
    postalCode: z.string().min(2, "Postal code is required"),
    country: z.string().min(2, "Country is required"),
});

export async function POST(request: Request): Promise<NextResponse> {
    try {
        // Get current user from session
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Parse request body
        const body = await request.json();

        // Validate address data
        const validationResult = addressSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json({
                error: "Invalid address data",
                details: validationResult.error.format()
            }, { status: 400 });
        }

        // Check if user already has a redemption
        const existingRedemption = await db.query.giftRedemptions.findFirst({
            where: eq(giftRedemptions.userId, user.id!)
        });

        if (existingRedemption) {
            return NextResponse.json({
                error: "Gift already redeemed",
                alreadyUsed: true
            }, { status: 400 });
        }

        // Check if user has invited at least 10 people
        const invitedCount = await db.query.groupMembers.findMany({
            where: eq(groupMembers.invitedBy, user.id!)
        });

        if (invitedCount.length < 10) {
            return NextResponse.json({
                error: "Not enough invitations to redeem gift",
                invitationCount: invitedCount.length
            }, { status: 400 });
        }

        // Save redemption data
        const { fullName, streetAddress, city, state, postalCode, country } = validationResult.data;

        await db.insert(giftRedemptions).values({
            userId: user.id!,
            fullName,
            streetAddress,
            city,
            state,
            postalCode,
            country,
        });

        return NextResponse.json({
            success: true,
            message: "Gift redemption successful. Your gift will be sent to the provided address."
        });

    } catch (error) {
        console.error("Error submitting address:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
