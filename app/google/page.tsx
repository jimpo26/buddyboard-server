"use client"
import { signIn } from "next-auth/react"
import { useEffect } from "react"

export default function Google() {
    useEffect(() => {
        signIn("google", {
            redirectTo: "/diocan",
        })
    }, [])
    return <div>Loading...</div>
}