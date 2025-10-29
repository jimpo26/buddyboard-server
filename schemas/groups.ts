import z from "zod";

export const CreateGroupSchema = z.object({
    name: z.string().min(3).max(50),
    description: z.string().max(1000).optional(),
    image: z.string().optional(),
    icon: z.string().optional(),
    color: z.string().max(7).optional(),
    isPublic: z.boolean().optional().default(false),
})