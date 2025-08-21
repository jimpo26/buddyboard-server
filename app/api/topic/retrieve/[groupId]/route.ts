import { db } from "@/lib/db"
import { currentUser } from "@/lib/auth";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
/*
type TopicList = {
    id: string,
    name: string,
    defaultText: string,
    description: string,
    icon: string,
    color: string,
    groupId: string,
    createdById: string,
    isActive: boolean,
    createdAt: string,
    updatedAt: string,
    last_message_content?: string,
    last_message_created_at?: string,
    last_message_user_name?: string,
    last_message_user_email?: string
}*/

// Retrieve the list of topics for a given groupId. Retrieve also the last message from all topics.
export async function GET(
    request: Request,
    { params }: { params: Promise<{ groupId: string }> }
) {
    const { groupId } = await params;
    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const topicList = await db.execute(sql`SELECT 
            t.id AS id,
            t.name AS name,
            t.default_text as defaultText,
            t.description as description,
            t.icon as icon,
            t.color as color,
            t.group_id as groupId,
            t.created_by_id as createdById,
            t.is_active as isActive,
            t.created_at as createdAt,
            t.updated_at as updatedAt,
            m.content AS last_message_content,
            m.created_at AS last_message_created_at,
            u.name AS last_message_user_name,
            u.email AS last_message_user_email
        FROM topics t
        LEFT JOIN LATERAL (
            SELECT *
            FROM messages
            WHERE messages.topic_id = t.id
            ORDER BY messages.created_at DESC
            LIMIT 1
        ) m ON true
        LEFT JOIN "user" u ON u.id = m.user_id
        WHERE t.group_id = ${groupId}
        ORDER BY t.created_at DESC`)
    return NextResponse.json({
        success: true,
        topics: topicList.rows.map(el => ({
            id: el.id,
            name: el.name,
            defaultText: el.defaulttext,
            description: el.description,
            icon: el.icon,
            color: el.color,
            groupId: el.groupid,
            createdById: el.createdbyid,
            isActive: el.isactive,
            createdAt: el.createdat,
            updatedAt: el.updatedat,
            lastMessageContent: el.last_message_content,
            lastMessageCreatedAt: el.last_message_created_at,
            lastMessageUserName: el.last_message_user_name,
            lastMessageUserEmail: el.last_message_user_email
        })),
    });
}
