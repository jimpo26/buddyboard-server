import { CreateGroupSchema } from "@/schemas/groups";
import z from "zod";
import { db } from "./db";
import { allowedMembersPrivateGroup, groupMembers, groups, users } from "@/db/schema";
import { and, eq, count } from "drizzle-orm";
import { AlreadyAMemberException, GroupLimitReachedException, GroupNotFoundException, NotAGroupMemberException, UserUnauthorizedException } from "@/exceptions/group";

function generateGroupLink() {
    return crypto.randomUUID().replaceAll("-", "");
}

export async function createGroup(values: z.infer<typeof CreateGroupSchema>, userId: string) {

    const group = await db.insert(groups).values({
        ...values,
        publicLink: values.isPublic ? generateGroupLink() : null,
        proprietaryUserId: userId,
    }).returning();

    await db.insert(groupMembers).values({
        groupId: group[0].id,
        userId,
        role: "owner",
    });
    return group;
}


export async function editGroup(values: z.infer<typeof CreateGroupSchema>, groupId: string) {
    const group = await db.update(groups).set({
        ...values,
        publicLink: values.isPublic ? generateGroupLink() : null,
    }).where(eq(groups.id, groupId)).returning();

    return group;
}


export async function joinGroup(userId: string, values: { publicLink?: string, invitedBy?: string, groupId?: string }) {
    if (!values.publicLink && !values.groupId) {
        throw new Error("No public link or group id provided");
    }
    if (values.publicLink) {
        const group = await db.select().from(groups).where(eq(groups.publicLink, values.publicLink)).limit(1);
        if (!group[0]) {
            throw new GroupNotFoundException("Group not found");
        }

        const existingMember = await db.select()
            .from(groupMembers)
            .where(and(eq(groupMembers.groupId, group[0].id), eq(groupMembers.userId, userId)))
            .limit(1);
        if (existingMember.length > 0) {
            throw new AlreadyAMemberException("User is already a member of this group");
        }

        const memberCount = await db.select({ count: count(groupMembers.id) })
            .from(groupMembers)
            .where(eq(groupMembers.groupId, group[0].id));
        if (!group[0].isPublic && memberCount[0].count >= group[0].memberLimit) {
            throw new GroupLimitReachedException("Group has reached its member limit");
        }

        // check if invitedBy is a valid, existing user
        let invitedByUser: { id?: string; }[] = [{ id: undefined }];
        if (values.invitedBy) {
            invitedByUser = await db.select({ id: users.id }).from(users).where(eq(users.id, values.invitedBy)).limit(1);
        }

        const [newMember] = await db.insert(groupMembers).values({
            groupId: group[0].id,
            userId,
            invitedBy: invitedByUser[0].id,
            role: "member",
        }).returning();
        return newMember;
    }

    const isMemberAllowed = await db.select()
        .from(allowedMembersPrivateGroup)
        .where(and(eq(allowedMembersPrivateGroup.userId, userId), eq(allowedMembersPrivateGroup.privateGroupId, values.groupId!)))
        .limit(1);
    if (isMemberAllowed.length === 0 || !isMemberAllowed[0]) {
        throw new UserUnauthorizedException("User is not allowed to join this group");
    }

    const existingMember = await db.select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, values.groupId!)))
        .limit(1);
    if (existingMember.length > 0) {
        throw new AlreadyAMemberException("User is already a member of this group");
    }

    const [newMember] = await db.insert(groupMembers).values({
        groupId: values.groupId!,
        invitedBy: isMemberAllowed[0].invitedBy,
        userId,
        role: "member",
    }).returning();
    // remove invitation
    await db.delete(allowedMembersPrivateGroup).where(and(eq(allowedMembersPrivateGroup.userId, userId), eq(allowedMembersPrivateGroup.privateGroupId, values.groupId!)));
    return newMember;
}

export async function leaveGroup(userId: string, groupId: string) {
    const existingMember = await db.select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
        .limit(1);
    if (existingMember.length === 0 || !existingMember[0]) {
        throw new NotAGroupMemberException("User is not a member of this group");
    }

    await db.delete(groupMembers).where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)));
    return true;
}

export async function dropInvitation(userId: string, groupId: string) {
    const existingMember = await db.select()
        .from(groupMembers)
        .where(and(eq(groupMembers.userId, userId), eq(groupMembers.groupId, groupId)))
        .limit(1);
    if (existingMember.length === 1) {
        throw new NotAGroupMemberException("User is a member of the group. Please leave the group first.");
    }

    await db.delete(allowedMembersPrivateGroup).where(and(eq(allowedMembersPrivateGroup.userId, userId), eq(allowedMembersPrivateGroup.privateGroupId, groupId)));
    return true;
}

export async function deleteGroup(userId: string, groupId: string) {
    // Check if the group exists and user is the owner
    const [group] = await db.select()
        .from(groups)
        .where(eq(groups.id, groupId))
        .limit(1);

    if (!group) {
        throw new GroupNotFoundException("Group not found");
    }

    // Check if user is the owner
    const [membership] = await db.select()
        .from(groupMembers)
        .where(and(
            eq(groupMembers.userId, userId),
            eq(groupMembers.groupId, groupId),
            eq(groupMembers.role, "owner")
        ))
        .limit(1);

    if (!membership) {
        throw new UserUnauthorizedException("Only the group owner can delete the group");
    }

    // Begin deletion process - delete all related data

    // 1. Delete all invitations
    await db.delete(allowedMembersPrivateGroup)
        .where(eq(allowedMembersPrivateGroup.privateGroupId, groupId));

    // 2. Delete all memberships
    await db.delete(groupMembers)
        .where(eq(groupMembers.groupId, groupId));

    // 3. Delete the group itself
    await db.delete(groups)
        .where(eq(groups.id, groupId));

    return true;
}