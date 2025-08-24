// SERVER src/db/schema.ts
import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index, uniqueIndex, primaryKey, char, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccountType } from "@auth/core/adapters"

export const users = pgTable("user", {
    id: text("id")
        .primaryKey()
        .$defaultFn(() => crypto.randomUUID()),
    name: text("name"),
    email: text("email").unique(),
    password: text("password"),
    emailVerified: timestamp("emailVerified", { mode: "date" }),
    image: text("image"),
    isTwoFactorEnabled: boolean("isTwoFactorEnabled").default(false).notNull(),
})

export const accounts = pgTable(
    "account",
    {
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        type: text("type").$type<AdapterAccountType>().notNull(),
        provider: text("provider").notNull(),
        providerAccountId: text("providerAccountId").notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: text("token_type"),
        scope: text("scope"),
        id_token: text("id_token"),
        session_state: text("session_state"),
    },
    (account) => [
        {
            compoundKey: primaryKey({
                columns: [account.provider, account.providerAccountId],
            }),
        },
    ]
)

export const sessions = pgTable("session", {
    sessionToken: text("sessionToken").primaryKey(),
    userId: text("userId")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
    "verificationToken",
    {
        identifier: text("identifier").notNull(),
        token: text("token").notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (verificationToken) => [
        {
            compositePk: primaryKey({
                columns: [verificationToken.identifier, verificationToken.token],
            }),
        },
    ]
)

export const authenticators = pgTable(
    "authenticator",
    {
        credentialID: text("credentialID").notNull().unique(),
        userId: text("userId")
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        providerAccountId: text("providerAccountId").notNull(),
        credentialPublicKey: text("credentialPublicKey").notNull(),
        counter: integer("counter").notNull(),
        credentialDeviceType: text("credentialDeviceType").notNull(),
        credentialBackedUp: boolean("credentialBackedUp").notNull(),
        transports: text("transports"),
    },
    (authenticator) => [
        {
            compositePK: primaryKey({
                columns: [authenticator.userId, authenticator.credentialID],
            }),
        },
    ]
)

export const passwordResetToken = pgTable(
    "password_reset_token",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        email: text("email").notNull(),
        token: text("token").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
)

export const twoFactorToken = pgTable(
    "two_factor_token",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        email: text("email").notNull(),
        token: text("token").notNull(),
        expiresAt: timestamp("expires_at").notNull(),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
)

export const twoFactorConfirmations = pgTable(
    "two_factor_confirmation",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
        createdAt: timestamp("created_at").defaultNow().notNull(),
    }
)

// Groups table
export const groups = pgTable("groups", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    description: text("description"),
    image: text("image"),
    icon: text("icon"),
    color: char("color", { length: 7 }),
    publicLink: text("public_link").unique(), // For sharing groups
    proprietaryUserId: text("proprietary_user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    isPublic: boolean("is_public").default(false).notNull(), // For monetization limits
    memberLimit: integer("member_limit").default(10).notNull(), // Free tier limit
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table: { publicLink: any; proprietaryUserId: any; }) => ([
    uniqueIndex("groups_public_link_idx").on(table.publicLink),
    index("groups_proprietary_user_idx").on(table.proprietaryUserId),
]));

// Group members (many-to-many relationship)
export const groupMembers = pgTable("group_members", {
    id: uuid("id").defaultRandom().primaryKey(),
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(), // "owner", "admin", "member"
    joinedAt: timestamp("joined_at").defaultNow().notNull(),
    invitedBy: text("invited_by").references(() => users.id, { onDelete: "set null" }),
}, (table: { groupId: any; userId: any; }) => ([
    uniqueIndex("group_members_group_user_idx").on(table.groupId, table.userId),
    index("group_members_group_id_idx").on(table.groupId),
    index("group_members_user_id_idx").on(table.userId),
]));

export const allowedMembersPrivateGroup = pgTable("allowed_members_private_group", {
    id: uuid("id").defaultRandom().primaryKey(),
    privateGroupId: uuid("private_group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    invitedBy: text("invited_by").notNull().references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table: { privateGroupId: any; userId: any; }) => ([
    uniqueIndex("allowed_members_private_group_group_user_idx").on(table.privateGroupId, table.userId),
    index("allowed_members_private_group_group_id_idx").on(table.privateGroupId),
    index("allowed_members_private_group_user_id_idx").on(table.userId),
]));

// Topics table
export const topics = pgTable("topics", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: text("name").notNull(),
    defaultText: varchar("default_text", { length: 80 }).notNull(),
    description: text("description"),
    icon: text("icon"), // Icon name or emoji
    color: text("color").default("#3B82F6"), // Hex color for UI
    groupId: uuid("group_id").notNull().references(() => groups.id, { onDelete: "cascade" }),
    createdById: text("created_by_id").notNull().references(() => users.id),
    isActive: boolean("is_active").default(true).notNull(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table: { groupId: any; createdById: any; }) => ([
    index("topics_group_id_idx").on(table.groupId),
    index("topics_created_by_idx").on(table.createdById),
]));

// Messages/Activities table - this is where users log activities
export const messages = pgTable("messages", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    topicId: uuid("topic_id").notNull().references(() => topics.id, { onDelete: "cascade" }),
    content: text("content"), // Optional text content
    // Metadata stored as JSON for flexibility
    metadata: jsonb("metadata").$type<{
        // Location data
        location?: {
            latitude: number;
            longitude: number;
            address?: string;
            placeName?: string;
        };
        // Media attachments
        images?: string[]; // Array of image URLs
        videos?: string[]; // Array of video URLs
        // Additional data
        notes?: string;
        tags?: string[];
        duration?: number; // In minutes (for activities like gym)
        rating?: number; // 1-5 scale
        customFields?: Record<string, any>;
    }>(),
    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table: { userId: any; topicId: any; createdAt: any; }) => ([
    index("messages_user_id_idx").on(table.userId),
    index("messages_topic_id_idx").on(table.topicId),
    index("messages_created_at_idx").on(table.createdAt),
    index("messages_user_topic_idx").on(table.userId, table.topicId),
]));

// User subscriptions/payments table
export const userSubscriptions = pgTable("user_subscriptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    subscriptionType: text("subscription_type").notNull(), // "ads_removal", "premium_groups", etc.
    status: text("status").notNull(), // "active", "expired", "cancelled"
    amount: integer("amount").notNull(), // Amount in cents (99 for €0.99)
    currency: text("currency").default("EUR").notNull(),
    // Payment provider data
    stripePaymentIntentId: text("stripe_payment_intent_id"),
    appleTransactionId: text("apple_transaction_id"),
    googlePlayOrderId: text("google_play_order_id"),
    // Timestamps
    purchasedAt: timestamp("purchased_at").defaultNow().notNull(),
    expiresAt: timestamp("expires_at"), // For recurring subscriptions
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table: { userId: any; subscriptionType: any; status: any; createdAt: any; }) => ([
    index("subscriptions_user_id_idx").on(table.userId),
    index("subscriptions_status_idx").on(table.status),
    index("subscriptions_type_idx").on(table.subscriptionType),
    index("subscriptions_created_at_idx").on(table.createdAt),
]));


// Push notification tokens table for storing Expo Push Tokens
export const pushTokens = pgTable("push_tokens", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    token: text("token").notNull(),
    deviceId: text("device_id").notNull(), // Unique identifier for the device
    deviceName: text("device_name"),
    deviceType: text("device_type"), // ios, android
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ([
    uniqueIndex("push_tokens_token_idx").on(table.token),
    uniqueIndex("push_tokens_user_device_idx").on(table.userId, table.deviceId),
    index("push_tokens_user_id_idx").on(table.userId),
]));


// Gift redemptions table for storing user gift address information
export const giftRedemptions = pgTable("gift_redemptions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    fullName: text("full_name").notNull(),
    streetAddress: text("street_address").notNull(),
    city: text("city").notNull(),
    state: text("state").notNull(),
    postalCode: text("postal_code").notNull(),
    country: text("country").notNull(),
    redeemedAt: timestamp("redeemed_at").defaultNow().notNull(),
    shipped: boolean("shipped").default(false).notNull(),
    shippedAt: timestamp("shipped_at"),
    trackingNumber: text("tracking_number"),
}, (table) => ([
    uniqueIndex("gift_redemptions_user_id_idx").on(table.userId),
    index("gift_redemptions_redeemed_at_idx").on(table.redeemedAt),
]));

// Define relationships for better TypeScript inference
export const usersRelations = relations(users, ({ many }) => ({
    groupsOwned: many(groups),
    groupMemberships: many(groupMembers),
    messages: many(messages),
    subscriptions: many(userSubscriptions),
    topicsCreated: many(topics),
    giftRedemptions: many(giftRedemptions),
}));

export const groupsRelations = relations(groups, ({ one, many }) => ({
    proprietaryUser: one(users, {
        fields: [groups.proprietaryUserId],
        references: [users.id],
    }),
    members: many(groupMembers),
    topics: many(topics),
}));

export const groupMembersRelations = relations(groupMembers, ({ one }) => ({
    group: one(groups, {
        fields: [groupMembers.groupId],
        references: [groups.id],
    }),
    user: one(users, {
        fields: [groupMembers.userId],
        references: [users.id],
    }),
}));

export const topicsRelations = relations(topics, ({ one, many }) => ({
    group: one(groups, {
        fields: [topics.groupId],
        references: [groups.id],
    }),
    createdBy: one(users, {
        fields: [topics.createdById],
        references: [users.id],
    }),
    messages: many(messages),
}));

export const messagesRelations = relations(messages, ({ one }) => ({
    user: one(users, {
        fields: [messages.userId],
        references: [users.id],
    }),
    topic: one(topics, {
        fields: [messages.topicId],
        references: [topics.id],
    }),
}));

export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
    user: one(users, {
        fields: [userSubscriptions.userId],
        references: [users.id],
    }),
}));

// Relations for push tokens
export const pushTokensRelations = relations(pushTokens, ({ one }) => ({
    user: one(users, {
        fields: [pushTokens.userId],
        references: [users.id],
    }),
}));

// Relations for gift redemptions
export const giftRedemptionsRelations = relations(giftRedemptions, ({ one }) => ({
    user: one(users, {
        fields: [giftRedemptions.userId],
        references: [users.id],
    }),
}));

// Export types for TypeScript
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Group = typeof groups.$inferSelect;
export type NewGroup = typeof groups.$inferInsert;
export type GroupMember = typeof groupMembers.$inferSelect;
export type NewGroupMember = typeof groupMembers.$inferInsert;
export type Topic = typeof topics.$inferSelect;
export type NewTopic = typeof topics.$inferInsert;
export type Message = typeof messages.$inferSelect;
export type NewMessage = typeof messages.$inferInsert;
export type UserSubscription = typeof userSubscriptions.$inferSelect;
export type NewUserSubscription = typeof userSubscriptions.$inferInsert;
export type VerificationToken = typeof verificationTokens.$inferSelect;
export type NewVerificationToken = typeof verificationTokens.$inferInsert;
export type PasswordResetToken = typeof passwordResetToken.$inferSelect;
export type NewPasswordResetToken = typeof passwordResetToken.$inferInsert;
export type TwoFactorToken = typeof twoFactorToken.$inferSelect;
export type NewTwoFactorToken = typeof twoFactorToken.$inferInsert;
export type PushToken = typeof pushTokens.$inferSelect;
export type NewPushToken = typeof pushTokens.$inferInsert;
export type GiftRedemption = typeof giftRedemptions.$inferSelect;
export type NewGiftRedemption = typeof giftRedemptions.$inferInsert;
