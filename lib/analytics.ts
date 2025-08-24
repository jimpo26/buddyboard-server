import { messages, users } from "@/db/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export const getStreakByUserAndTopic = async (userId: string, topic: { id: string, defaulttext: string }) => {

    const allTopicMessages = await db
        .select({
            userId: messages.userId,
            userName: users.name,
            userImage: users.image,
            date: sql<string>`DATE(${messages.createdAt})`,
        })
        .from(messages)
        .innerJoin(users, eq(messages.userId, users.id))
        .where(and(eq(messages.topicId, topic.id), eq(messages.content, topic.defaulttext), eq(messages.userId, userId)))
        .orderBy(messages.userId, desc(messages.createdAt));

    const userData: { userName: string | null, userImage: string | null, dates: string[] } = {
        userName: allTopicMessages[0].userName,
        userImage: allTopicMessages[0].userImage,
        dates: []
    };
    allTopicMessages.forEach((msg: any) => {
        if (!userData.dates.includes(msg.date)) {
            userData.dates.push(msg.date);
        }
    });

    const sortedDates = userData.dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    if (sortedDates.length === 0) {
        return {
            userId,
            userName: userData.userName,
            userImage: userData.userImage,
            currentStreak: 0,
            longestStreak: 0,
            lastActivityDate: ''
        }
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

    return {
        userId,
        userName: userData.userName,
        userImage: userData.userImage,
        currentStreak,
        longestStreak,
        lastActivityDate: sortedDates[0] || ''
    }
}