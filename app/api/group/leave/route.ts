import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { leaveGroup } from "@/lib/groups";
import { NotAGroupMemberException } from "@/exceptions/group";

export async function POST(request: Request): Promise<NextResponse> {
    const values = await request.json();

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    if (!values.groupId) {
        return NextResponse.json({ error: "Group ID is required!" })
    }
    try {
        const group = await leaveGroup(user.id!, values.groupId);
        return NextResponse.json({ success: true, group });
    } catch (error) {
        if (error instanceof NotAGroupMemberException) {
            return NextResponse.json({ error: error.message })
        }
        return NextResponse.json({ error: "Something went wrong!" })
    }
}
