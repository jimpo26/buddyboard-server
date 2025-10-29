import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { deleteGroup } from "@/lib/groups";
import { GroupNotFoundException, UserUnauthorizedException } from "@/exceptions/group";

export async function POST(request: Request): Promise<NextResponse> {
    const values = await request.json();

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" }, { status: 401 });
    }

    if (!values.groupId) {
        return NextResponse.json({ error: "Group ID is required!" }, { status: 400 });
    }
    
    try {
        await deleteGroup(user.id!, values.groupId);
        return NextResponse.json({ success: true });
    } catch (error) {
        if (error instanceof GroupNotFoundException) {
            return NextResponse.json({ error: error.message }, { status: 404 });
        }
        if (error instanceof UserUnauthorizedException) {
            return NextResponse.json({ error: error.message }, { status: 403 });
        }
        console.error("Error deleting group:", error);
        return NextResponse.json({ error: "Something went wrong!" }, { status: 500 });
    }
}
