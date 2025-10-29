import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { allowedMembersPrivateGroup, groups, users } from '@/db/schema';
import { and, eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
    try {
        const user = await currentUser()

        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        // Parse request body
        const { groupId, email } = await request.json();

        // Validate request data
        if (!groupId || !email) {
            return NextResponse.json(
                { success: false, error: 'Group ID and email are required' },
                { status: 400 }
            );
        }

        // Check if user has permission to invite (must be owner)
        const group = await db.select()
            .from(groups)
            .where(and(eq(groups.id, groupId), eq(groups.proprietaryUserId, user.id!)))

        if (!group) {
            return NextResponse.json({ success: false, error: 'Group not found' }, { status: 404 });
        }

        // Check if user exists with the provided email
        const targetUser = await db.select()
            .from(users)
            .where(eq(users.email, email))


        // If the user exists, notify them through the app
        if (targetUser) {
            await db.insert(allowedMembersPrivateGroup).values({
                privateGroupId: groupId,
                userId: targetUser[0].id,
                invitedBy: user.id!
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Invitation sent to the user'
        });

    } catch (error) {
        console.error('Error sending invitation:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to send invitation' },
            { status: 500 }
        );
    }
}
