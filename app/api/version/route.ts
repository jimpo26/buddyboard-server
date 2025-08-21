export async function POST(req: Request) {
    const { signedVersion } = await req.json();
    console.log(signedVersion, process.env.CURRENT_SIGNED_APP_VERSION)
    if (!signedVersion) return Response.json({ success: false });

    if (signedVersion !== process.env.CURRENT_SIGNED_APP_VERSION) return Response.json({ success: false });
    return Response.json({ success: true });
}