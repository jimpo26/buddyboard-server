import { groupMembers, groups } from "@/db/schema";
import { NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db"

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const group = await db.select({
        name: groups.name,
        description: groups.description,
        image: groups.image,
        icon: groups.icon,
        color: groups.color,
        isPublic: groups.isPublic,
        publicLink: groups.publicLink,
        proprietaryUserId: groups.proprietaryUserId,
        isOwner: eq(groups.proprietaryUserId, user.id!)
    })
        .from(groups)
        .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
        .where(and(eq(groups.id, id), eq(groupMembers.userId, user.id!)))
        .limit(1)

    return NextResponse.json({ success: true, group });
}