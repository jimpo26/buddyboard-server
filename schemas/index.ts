import * as z from "zod"

export const LoginSchema = z.object({
    email: z.email({
        message: "Email is required"
    }),
    password: z.string().min(1, {
        message: "Password is required"
    }),
    code: z.optional(z.string().length(6, {
        message: "Code must be 6 characters"
    }))
});

export const RegisterSchema = z.object({
    email: z.email({
        message: "Email is required"
    }),
    password: z.string().min(6, {
        message: "Minimum 6 characters required"
    }),
    name: z.string().min(1, {
        message: "Name is required"
    }),
});

export const ResetSchema = z.object({
    email: z.email({
        message: "Email is required"
    }),
});

export const NewPasswordSchema = z.object({
    password: z.string().min(6, {
        message: "Minimum 6 characters required"
    }),
});

export const SettingsSchema = z.object({
    name: z.optional(z.string()),
    isTwoFactorEnabled: z.optional(z.boolean()),
    email: z.optional(z.email()),
    password: z.optional(z.string().min(6)),
    newPassword: z.optional(z.string().min(6)),
}).refine((data) => {
    return !(data.password && !data.newPassword);
}, {
    message: "New password is required!",
    path: ["newPassword"]
}).refine((data) => {
    return !(data.newPassword && !data.password);
}, {
    message: "Password is required!",
    path: ["password"]
});
