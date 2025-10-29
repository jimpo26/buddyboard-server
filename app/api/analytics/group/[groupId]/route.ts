import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, topics, groupMembers, users } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { auth } from "@/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ groupId: string }> }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { groupId } = await params;
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get("timeRange") || "30d"; // 7d, 30d, 90d, 1y

        // Verify user is member of the group
        const membership = await db
            .select()
            .from(groupMembers)
            .where(
                and(
                    eq(groupMembers.groupId, groupId),
                    eq(groupMembers.userId, session.user.id)
                )
            )
            .limit(1);

        if (membership.length === 0) {
            return NextResponse.json({ error: "Not a member of this group" }, { status: 403 });
        }

        // Calculate date range
        const now = new Date();
        const startDate = new Date();
        switch (timeRange) {
            case "7d":
                startDate.setDate(now.getDate() - 7);
                break;
            case "30d":
                startDate.setDate(now.getDate() - 30);
                break;
            case "90d":
                startDate.setDate(now.getDate() - 90);
                break;
            case "1y":
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                startDate.setDate(now.getDate() - 30);
        }

        // 1. Total Activities Over Time
        const activitiesOverTime = await db
            .select({
                date: sql<string>`DATE(${messages.createdAt})`,
                count: count(),
            })
            .from(messages)
            .innerJoin(topics, eq(messages.topicId, topics.id))
            .where(
                and(
                    eq(topics.groupId, groupId),
                    sql`${messages.createdAt} >= ${startDate}`
                )
            )
            .groupBy(sql`DATE(${messages.createdAt})`)
            .orderBy(sql`DATE(${messages.createdAt})`);

        // 2. Leaderboard - Top performers in group
        const leaderboard = await db
            .select({
                userId: messages.userId,
                userName: users.name,
                userImage: users.image,
                count: count(),
            })
            .from(messages)
            .innerJoin(topics, eq(messages.topicId, topics.id))
            .innerJoin(users, eq(messages.userId, users.id))
            .where(
                and(
                    eq(topics.groupId, groupId),
                    sql`${messages.createdAt} >= ${startDate}`
                )
            )
            .groupBy(messages.userId, users.name, users.image)
            .orderBy(desc(count()))
            .limit(10);

        // 3. Topic Distribution - Which topics are most used
        const topicDistribution = await db
            .select({
                topicId: messages.topicId,
                topicName: topics.name,
                topicColor: topics.color,
                topicIcon: topics.icon,
                count: count(),
            })
            .from(messages)
            .innerJoin(topics, eq(messages.topicId, topics.id))
            .where(
                and(
                    eq(topics.groupId, groupId),
                    sql`${messages.createdAt} >= ${startDate}`
                )
            )
            .groupBy(messages.topicId, topics.name, topics.color, topics.icon)
            .orderBy(desc(count()));

        // Calculate percentages for topic distribution
        const totalActivities = topicDistribution.reduce((sum: number, topic: any) => sum + topic.count, 0);
        const topicDistributionWithPercentages = topicDistribution.map((topic: any) => ({
            ...topic,
            percentage: totalActivities > 0 ? (topic.count / totalActivities) * 100 : 0,
        }));

        return NextResponse.json({
            activitiesOverTime,
            leaderboard,
            topicDistribution: topicDistributionWithPercentages,
            timeRange,
            totalActivities,
        });

    } catch (error) {
        console.error("Error fetching group analytics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
