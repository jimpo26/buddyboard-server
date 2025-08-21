import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createTopic } from "@/lib/topics";
import { groups } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { CreateTopicSchema } from "@/schemas/topics";
import { db } from "@/lib/db"

export async function POST(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { groupId, data } = values
    const validatedFields = CreateTopicSchema.safeParse(data);

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

    const { name, description, icon, color, isActive, defaultText } = validatedFields.data

    const topic = await createTopic({ name, description, icon, color, isActive, defaultText }, groupId, user.id!);

    return NextResponse.json({ success: true, topic });
}
