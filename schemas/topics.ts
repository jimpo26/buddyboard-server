import z from "zod";

export const CreateTopicSchema = z.object({
    name: z.string().min(3).max(50),
    defaultText: z.string().min(1).max(80),
    description: z.string().max(1000).optional(),
    icon: z.string().optional(),
    color: z.string().max(7).optional(),
    isActive: z.boolean().optional().default(true)
})