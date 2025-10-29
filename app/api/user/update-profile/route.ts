import { users } from "@/db/schema"
import { currentUser } from "@/lib/auth"
import { db } from "@/lib/db"
import { eq } from "drizzle-orm"

export async function PATCH(req: Request) {
    // change name 
    const body = await req.json()
    const { name } = body

    const user = await currentUser()
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    await db.update(users)
        .set({ name })
        .where(eq(users.id, user.id!))
        .returning()

    return Response.json({ success: true })
}
