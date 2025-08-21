import { allowedMembersPrivateGroup, groupMembers, groups, users } from "@/db/schema";
import { NextRequest, NextResponse } from "next/server";
import { and, count, eq, sql, isNull } from "drizzle-orm";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    const user = await currentUser()
    console.log("in the api route", user)
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }
    // check if searchParams contains notification=true
    const searchParams = request.nextUrl.searchParams;
    const notifications = searchParams.get("notifications");
    let invitations = {};
    if (notifications === "true") {
        invitations = await db
            .select({
                groupId: allowedMembersPrivateGroup.privateGroupId,
                name: groups.name,
                description: groups.description,
                image: groups.image,
                icon: groups.icon,
                color: groups.color,
                invitedBy: users.name
            })
            .from(allowedMembersPrivateGroup)
            .leftJoin(
                groupMembers,
                and(
                    eq(groupMembers.userId, allowedMembersPrivateGroup.userId),
                    eq(groupMembers.groupId, allowedMembersPrivateGroup.privateGroupId)
                )
            )
            .innerJoin(users, eq(users.id, allowedMembersPrivateGroup.invitedBy))
            .innerJoin(groups, eq(groups.id, allowedMembersPrivateGroup.privateGroupId))
            .where(and(isNull(groupMembers.userId), eq(allowedMembersPrivateGroup.userId, user.id!)));

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
        groupId: groups.id,
        members: count(groupMembers.id).as("member_count")
    })
        .from(groups)
        .innerJoin(groupMembers, eq(groups.id, groupMembers.groupId))
        .where(
            sql`EXISTS (
              SELECT 1
              FROM ${groupMembers} gm
              WHERE gm.user_id = ${user.id}
              AND gm.group_id = ${groups.id}
            )`
        )
        .groupBy(groups.name, groups.description, groups.image, groups.icon, groups.color, groups.isPublic, groups.publicLink, groups.proprietaryUserId, groups.id)
    console.log(group, invitations)
    return NextResponse.json({ success: true, group, invitations });
}