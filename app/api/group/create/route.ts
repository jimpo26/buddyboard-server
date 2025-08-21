import { currentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createGroup } from "@/lib/groups";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import sharp from "sharp"

// Disable body parsing for file uploads
export const config = {
    api: {
        bodyParser: false,
    },
};


export async function POST(req: Request): Promise<NextResponse> {
    // Run multer middleware
    const formData = await req.formData();

    const file = formData.get('image');
    const name = formData.get('name') as string;
    if (!name || name.length < 3) {
        return NextResponse.json({ error: 'Name must be at least 3 characters long' }, { status: 400 });
    }
    const description = formData.get('description') as string;
    const isPublic = formData.get('isPublic') === "true";
    const icon = formData.get('icon') as string;
    const color = formData.get('color') as string;
    if (color.length !== 7) {
        return NextResponse.json({ error: 'Invalid color' }, { status: 400 });
    }

    let optimizedUrl = undefined
    if (file && file instanceof File) {
        // Convert File to Buffer
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.name) || '.jpg';
        const filename = `image-${uniqueSuffix}${extension}`;

        // Ensure upload directory exists
        const uploadDir = path.join(process.cwd(), 'public/uploads/images');
        await fs.mkdir(uploadDir, (err) => {
            if (err) {
                console.error('Failed to create upload directory:', err);
            }
        });

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
    }

    const user = await currentUser()
    if (!user) {
        return NextResponse.json({ error: "Unauthorized!" })
    }

    const group = await createGroup({ name, description, image: optimizedUrl, icon, color, isPublic }, user.id!);

    return NextResponse.json({ success: true, group });
}
