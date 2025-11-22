import { allowedMembersPrivateGroup, groupMembers, groups, messages, pushTokens, topics, users } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function DELETE(request: Request): Promise<NextResponse> {
    const user = await currentUser();
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // delete account
    await db.transaction(async (tx) => {
        await tx.delete(groupMembers).where(eq(groupMembers.userId, user.id!));
        await tx.delete(allowedMembersPrivateGroup).where(eq(allowedMembersPrivateGroup.userId, user.id!));
        await tx.delete(allowedMembersPrivateGroup).where(eq(allowedMembersPrivateGroup.invitedBy, user.id!));
        await tx.delete(messages).where(eq(messages.userId, user.id!));
        await tx.delete(topics).where(eq(topics.createdById, user.id!));
        await tx.delete(groups).where(eq(groups.proprietaryUserId, user.id!));
        await tx.delete(pushTokens).where(eq(pushTokens.userId, user.id!));
        await tx.delete(users).where(eq(users.id, user.id!));
    });

    return NextResponse.json({ success: true });
}