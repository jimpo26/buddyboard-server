import { groupMembers, giftRedemptions } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { asc, count, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request): Promise<NextResponse> {
    try {
        const user = await currentUser();
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const invitedUsers = await db
            .selectDistinctOn([groupMembers.userId], {
                userId: groupMembers.userId,
                joinedAt: groupMembers.joinedAt,
            })
            .from(groupMembers)
            .where(eq(groupMembers.invitedBy, user.id!))
            .orderBy(
                groupMembers.userId,        // 👈 deve esserci sempre
                asc(groupMembers.joinedAt)  // 👈 asc = prende il meno recente
            )
            .limit(10);

        // Check if user has already redeemed their gift
        const existingRedemption = await db.query.giftRedemptions.findFirst({
            where: eq(giftRedemptions.userId, user.id!)
        });

        if (existingRedemption) {
            return NextResponse.json({
                success: true,
                number: invitedUsers.length,
                alreadyUsed: true
            });
        }

        return NextResponse.json({
            success: true,
            number: invitedUsers.length,
            alreadyUsed: false
        });
    } catch (error) {
        console.error("Error fetching invited users:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}