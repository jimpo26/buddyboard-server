import { deleteTopic } from "@/lib/topics";
import { NextResponse } from "next/server";

export async function DELETE(request: Request): Promise<NextResponse> {
    const values = await request.json();
    const { topicId } = values

    if (!topicId) {
        return NextResponse.json({ error: "Invalid fields!" })
    }

    const topic = await deleteTopic(topicId);

    return NextResponse.json({ success: true, topic });   
}