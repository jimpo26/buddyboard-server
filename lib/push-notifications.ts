import { db } from "@/lib/db";
import { pushTokens } from "@/db/schema";
import { groupMembers, users, topics, groups } from "@/db/schema";
import { eq, ne, and, inArray } from "drizzle-orm";

const EXPO_PUSH_API_URL = "https://exp.host/--/api/v2/push/send";

/**
 * Send push notifications to group members when a new message is posted
 */
export async function sendMessageNotification({
    topicId,
    groupId,
    senderId,
    senderName,
    messageContent,
}: {
    topicId: string;
    groupId: string;
    senderId: string;
    senderName: string;
    messageContent: string;
}) {
    try {
        // 1. Get the topic and group information
        const topicInfo = await db.select({
            topicName: topics.name,
            groupName: groups.name,
            groupId: groups.id,
        })
            .from(topics)
            .innerJoin(groups, eq(topics.groupId, groups.id))
            .where(eq(topics.id, topicId))
            .limit(1);

        if (!topicInfo.length) {
            console.error(`Topic ${topicId} not found`);
            return;
        }

        const { topicName, groupName, groupId: retrievedGroupId } = topicInfo[0];

        // 2. Get all group members except the sender
        const members = await db.select({
            userId: groupMembers.userId,
        })
            .from(groupMembers)
            .where(and(
                eq(groupMembers.groupId, retrievedGroupId),
                ne(groupMembers.userId, senderId)
            ));

        if (!members.length) {
            console.log(`No other members in group ${retrievedGroupId}`);
            return;
        }

        // 3. Get all push tokens for these members
        const memberIds = members.map(m => m.userId);
        const tokens = await db.select()
            .from(pushTokens)
            .where(and(
                inArray(pushTokens.userId, memberIds),
                eq(pushTokens.isActive, true)
            ));

        if (!tokens.length) {
            console.log(`No push tokens found for group members`);
            return;
        }

        // 4. Prepare notification content
        // Keep message content brief for notification (max 100 chars)
        const truncatedMessage = messageContent.length > 100
            ? `${messageContent.substring(0, 97)}...`
            : messageContent;

        // 5. Send notifications via Expo Push API
        const notifications = tokens.map(token => ({
            to: token.token,
            title: `${groupName} • ${topicName}`,
            body: `${senderName}: ${truncatedMessage}`,
            data: {
                groupId: retrievedGroupId,
                topicId,
                senderId,
                type: 'new_message'
            },
            sound: 'default',
            badge: 1,
            channelId: 'new-messages'
        }));

        // 6. Send push notifications in batches of 100 (Expo's limit)
        for (let i = 0; i < notifications.length; i += 100) {
            const batch = notifications.slice(i, i + 100);

            const response = await fetch(EXPO_PUSH_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    "Host": "exp.host",
                    "Accept": "application/json",
                    "Accept-Encoding": "gzip, deflate"
                },
                body: JSON.stringify(batch)
            });

            if (!response.ok) {
                console.error(`Failed to send push notifications: ${response.status}`);
                const errorData = await response.json();
                console.error(errorData);
            }
        }

        console.log(`Successfully sent ${notifications.length} push notifications for message in ${topicName}`);
        return notifications.length;
    } catch (error) {
        console.error('Error sending push notifications:', error);
        throw error;
    }
}

/**
 * Handle token expiration or errors
 * This should be called when we receive an error from Expo
 */
export async function deactivateExpiredPushToken(token: string) {
    try {
        await db.update(pushTokens)
            .set({ isActive: false })
            .where(eq(pushTokens.token, token));

        console.log(`Deactivated expired push token: ${token}`);
    } catch (error) {
        console.error('Error deactivating push token:', error);
    }
}
