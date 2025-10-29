import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { messages, topics, groupMembers, users } from "@/db/schema";
import { eq, and, desc, count, sql } from "drizzle-orm";
import { currentUser } from "@/lib/auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ topicId: string }> }
) {
    try {
        const user = await currentUser()
        if (!user || !user.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { topicId } = await params;
        const { searchParams } = new URL(request.url);
        const timeRange = searchParams.get("timeRange") || "30d"; // 7d, 30d, 90d, 1y

        // Get topic and verify user has access to it
        const topic = await db
            .select({
                id: topics.id,
                name: topics.name,
                groupId: topics.groupId,
                color: topics.color,
                icon: topics.icon,
                defaultText: topics.defaultText,
            })
            .from(topics)
            .where(eq(topics.id, topicId))
            .limit(1);

        if (topic.length === 0) {
            return NextResponse.json({ error: "Topic not found" }, { status: 404 });
        }

        // Verify user is member of the group that contains this topic
        const membership = await db
            .select()
            .from(groupMembers)
            .where(
                and(
                    eq(groupMembers.groupId, topic[0].groupId),
                    eq(groupMembers.userId, user.id)
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

        // 1. Topic Activity Timeline - Daily activity counts
        const activityTimeline = await db
            .select({
                date: sql<string>`DATE(${messages.createdAt})`,
                count: count(),
            })
            .from(messages)
            .where(
                and(
                    eq(messages.topicId, topicId),
                    eq(messages.content, topic[0].defaultText),
                    sql`${messages.createdAt} >= ${startDate}`
                )
            )
            .groupBy(sql`DATE(${messages.createdAt})`)
            .orderBy(sql`DATE(${messages.createdAt})`);

        // 2. Top Performers in this topic
        const topPerformers = await db
            .select({
                userId: messages.userId,
                userName: users.name,
                userImage: users.image,
                count: count(),
            })
            .from(messages)
            .innerJoin(users, eq(messages.userId, users.id))
            .where(
                and(
                    eq(messages.topicId, topicId),
                    eq(messages.content, topic[0].defaultText),
                    sql`${messages.createdAt} >= ${startDate}`
                )
            )
            .groupBy(messages.userId, users.name, users.image)
            .orderBy(desc(count()))
            .limit(10);

        // 3. Calculate streaks for users
        const allTopicMessages = await db
            .select({
                userId: messages.userId,
                userName: users.name,
                userImage: users.image,
                date: sql<string>`DATE(${messages.createdAt})`,
            })
            .from(messages)
            .innerJoin(users, eq(messages.userId, users.id))
            .where(and(eq(messages.topicId, topicId), eq(messages.content, topic[0].defaultText)))
            .orderBy(messages.userId, desc(messages.createdAt));

        // Calculate current streaks
        const userStreaks = new Map<string, {
            userId: string;
            userName: string;
            userImage: string | null;
            currentStreak: number;
            longestStreak: number;
            lastActivityDate: string;
        }>();

        // Group messages by user and calculate streaks
        const userMessages = new Map<string, {
            userName: string;
            userImage: string | null;
            dates: string[]
        }>();

        allTopicMessages.forEach((msg: any) => {
            if (!userMessages.has(msg.userId)) {
                userMessages.set(msg.userId, {
                    userName: msg.userName || 'Unknown User',
                    userImage: msg.userImage,
                    dates: []
                });
            }
            const userData = userMessages.get(msg.userId)!;
            if (!userData.dates.includes(msg.date)) {
                userData.dates.push(msg.date);
            }
        });

        // Calculate streaks for each user
        userMessages.forEach((userData, userId) => {
            const sortedDates = userData.dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

            let currentStreak = 0;
            let longestStreak = 0;
            let tempStreak = 1;

            if (sortedDates.length === 0) {
                userStreaks.set(userId, {
                    userId,
                    userName: userData.userName,
                    userImage: userData.userImage,
                    currentStreak: 0,
                    longestStreak: 0,
                    lastActivityDate: ''
                });
                return;
            }

            // Check if current streak is active (last activity was today or yesterday)
            const today = new Date();
            const yesterday = new Date();
            yesterday.setDate(today.getDate() - 1);

            const lastActivityDate = new Date(sortedDates[0]);
            const todayStr = today.toISOString().split('T')[0];
            const yesterdayStr = yesterday.toISOString().split('T')[0];

            if (sortedDates[0] === todayStr || sortedDates[0] === yesterdayStr) {
                currentStreak = 1;

                // Count consecutive days
                for (let i = 1; i < sortedDates.length; i++) {
                    const currentDate = new Date(sortedDates[i - 1]);
                    const prevDate = new Date(sortedDates[i]);
                    const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                    if (diffDays === 1) {
                        currentStreak++;
                    } else {
                        break;
                    }
                }
            }

            // Calculate longest streak
            for (let i = 1; i < sortedDates.length; i++) {
                const currentDate = new Date(sortedDates[i - 1]);
                const prevDate = new Date(sortedDates[i]);
                const diffDays = Math.floor((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

                if (diffDays === 1) {
                    tempStreak++;
                } else {
                    longestStreak = Math.max(longestStreak, tempStreak);
                    tempStreak = 1;
                }
            }
            longestStreak = Math.max(longestStreak, tempStreak);

            userStreaks.set(userId, {
                userId,
                userName: userData.userName,
                userImage: userData.userImage,
                currentStreak,
                longestStreak,
                lastActivityDate: sortedDates[0] || ''
            });
        });

        // Convert to array and sort by current streak
        const streaksArray = Array.from(userStreaks.values())
            .sort((a, b) => b.currentStreak - a.currentStreak)
            .slice(0, 10);

        return NextResponse.json({
            topic: topic[0],
            activityTimeline,
            topPerformers,
            streaks: streaksArray,
            timeRange,
        });

    } catch (error) {
        console.error("Error fetching topic analytics:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}