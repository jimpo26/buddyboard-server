import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY)

export const sendVerificationEmail = async (email: string, token: string) => {
    const confirmLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-verification?token=${token}`

    await resend.emails.send({
        from: `verify-account@${process.env.EMAIL_DOMAIN}`,
        to: email,
        subject: "Confirm your email",
        html: `<p>Click <a href="${confirmLink}">here</a> to confirm your email.</p>`
    })
}

export const sendPasswordResetEmail = async (email: string, token: string) => {
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/new-password?token=${token}`

    await resend.emails.send({
        from: `reset-password@${process.env.EMAIL_DOMAIN}`,
        to: email,
        subject: "Reset your password",
        html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`
    })
}

export const sendTwoFactorTokenEmail = async (email: string, token: string) => {
    await resend.emails.send({
        from: `2fa@${process.env.EMAIL_DOMAIN}`,
        to: email,
        subject: "Your two-factor token",
        html: `<p>Your two-factor token is <span style="font-weight: bold; font-size: larger">${token}</span></p>`
    })
}