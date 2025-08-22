import path from "path";
import fs from "fs";
import sharp from "sharp"
import { currentUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { groups, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Disable body parsing for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }
    const type = req.nextUrl.searchParams.get('type') || "profile"
    const id = req.nextUrl.searchParams.get('id') || user.id!
    const formData = await req.formData();
    const file = formData.get('image');

    let optimizedUrl = undefined
    try {
        if (file && file instanceof File) {
            // Convert File to Buffer
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            // Create filename
            const extension = path.extname(file.name) || '.jpg';
            const filename = `${type}-${id}${extension}`;

            // Ensure upload directory exists
            const uploadDir = path.join(process.cwd(), 'public/uploads/images');
            if (!fs.existsSync(uploadDir)) {
                await fs.mkdir(uploadDir, (err) => {
                    if (err) {
                        console.error('Failed to create upload directory:', err);
                    }
                });
            }

            // Save original file
            const filePath = path.join(uploadDir, filename);
            await fs.writeFile(filePath, buffer, (err) => {
                if (err) {
                    console.error('Failed to save file:', err);
                }
            });

            // Optimize with Sharp
            const optimizedFilename = `opt_${filename}`;
            const optimizedPath = path.join(uploadDir, optimizedFilename);

            await sharp(buffer)
                .resize(800, 800, { fit: 'inside', withoutEnlargement: true })
                .jpeg({ quality: 80 })
                .toFile(optimizedPath);

            optimizedUrl = `/uploads/images/${optimizedFilename}`;
            const res = await db.update(type === "profile" ? users : groups)
                .set({ image: optimizedUrl })
                .where(eq(type === "profile" ? users.id : groups.id, id))
                .returning()
            return NextResponse.json({ success: true, user: res[0] })
        }
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }
}