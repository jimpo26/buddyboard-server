import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { dropInvitation, joinGroup } from "@/lib/groups";
import { AlreadyAMemberException, GroupLimitReachedException, GroupNotFoundException } from "@/exceptions/group";

export async function POST(request: Request): Promise<NextResponse> {
    const values = await request.json();

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const { groupId, accept, publicLink } = values

    try {
        if (!accept) {
            const group = await dropInvitation(user.id!, groupId);
            return NextResponse.json({ success: true, group });
        }
        const [link, invitedBy] = publicLink?.split("?")
        console.log({ publicLink: link?.split("/").pop(), invitedBy })
        const group = await joinGroup(user.id!, {
            publicLink: link?.split("/").pop(), invitedBy: invitedBy?.replace("\n", ""), groupId
        });
        return NextResponse.json({ success: true, group });
    } catch (error) {
        if (error instanceof GroupNotFoundException) {
            return NextResponse.json({ error: error.message })
        }
        if (error instanceof AlreadyAMemberException) {
            return NextResponse.json({ error: error.message })
        }
        if (error instanceof GroupLimitReachedException) {
            return NextResponse.json({ error: error.message })
        }
        return NextResponse.json({ error: "Something went wrong!" })
    }
}
