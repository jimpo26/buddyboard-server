import { groups } from "@/db/schema";
import { currentUser } from "@/lib/auth";
import { editGroup } from "@/lib/groups";
import { CreateGroupSchema } from "@/schemas/groups";
import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/lib/db"

export async function PATCH(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { groupId, data } = values
    const validatedFields = CreateGroupSchema.safeParse(data);

    if (!validatedFields.success || !groupId) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const isUserProprietary = await db.select()
        .from(groups)
        .where(and(eq(groups.id, groupId), eq(groups.proprietaryUserId, user.id!)))
        .limit(1)

    if (isUserProprietary.length === 0) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const { name, description, image, icon, color, isPublic } = validatedFields.data

    const group = await editGroup({ name, description, image, icon, color, isPublic }, groupId);

    return NextResponse.json({ success: true, group });
}
