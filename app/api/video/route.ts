import { get } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const blob =
    "https://cqx6bcixmo4ctoaz.private.blob.vercel-storage.com/ccc_8525.mp4";

  try {
    const blobResult = await get(blob, { access: "private" });

    if (!!blobResult) {
      // streaming headers
      const headers = new Headers();
      headers.set("Content-Type", blobResult.blob.contentType ?? "notNull");
      headers.set("X-Content-Type-Options", "nosniff");
      headers.set("Cache-Control", "private, no-cache"); // Recommended for private content

      // this is extremely slow and I don't know why
      return new NextResponse(blobResult.stream, {
        status: 200,
        headers,
      });
    } else
      new NextResponse("err", {
        status: 500,
      });
  } catch (error) {
    console.error(error);
  }
}
