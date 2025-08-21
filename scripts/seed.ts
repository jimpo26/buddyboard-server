import { db } from '@/lib/db';
import { users, groups, topics, groupMembers } from '@/db/schema';

async function seed() {
    console.log('🌱 Seeding database...');

    // Create sample users
    const [user1, user2] = await db.insert(users).values([
        {
            name: 'John Doe',
            email: 'john@example.com',
            picture: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        },
        {
            name: 'Jane Smith',
            email: 'jane@example.com',
            picture: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150',
        }
    ]).returning();

    // Create sample group
    const [group] = await db.insert(groups).values({
        name: 'Fitness Friends',
        description: 'Track our fitness journey together',
        publicLink: 'fitness-friends-2024',
        proprietaryUserId: user1.id,
    }).returning();

    // Add users to group
    await db.insert(groupMembers).values([
        {
            groupId: group.id,
            userId: user1.id,
            role: 'owner',
        },
        {
            groupId: group.id,
            userId: user2.id,
            role: 'member',
        }
    ]);

    // Create sample topics
    await db.insert(topics).values([
        {
            name: 'Gym Workout',
            description: 'Track gym sessions',
            icon: '💪',
            color: '#EF4444',
            groupId: group.id,
            createdById: user1.id,
        },
        {
            name: 'Running',
            description: 'Track running activities',
            icon: '🏃‍♂️',
            color: '#10B981',
            groupId: group.id,
            createdById: user1.id,
        },
        {
            name: 'Water Intake',
            description: 'Track daily water consumption',
            icon: '💧',
            color: '#3B82F6',
            groupId: group.id,
            createdById: user2.id,
        }
    ]);

    console.log('✅ Database seeded successfully!');
}

seed().catch(console.error);