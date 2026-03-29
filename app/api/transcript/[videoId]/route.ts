import { NextResponse } from "next/server";
import { getTranscript } from "@/utils/serverUtils";

export async function GET(
  request: Request,
  // next 15+ made some methods asynchronous for internal optiization - handle params as promise
  { params }: { params: Promise<{ videoId: string }> },
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      throw new Error("Missing videoId from request");
    }

    const transcript = await getTranscript(videoId);

    if (transcript) {
      return NextResponse.json({
        id: videoId,
        transcript: transcript,
        createdAt: new Date().toISOString(),
      });
    } else {
      return NextResponse.json({
        id: videoId,
        transcript: `There is no transcript available for ${videoId}`,
        createdAt: new Date().toISOString(),
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        id: null,
        transcript: `An unknown error occured`,
        createdAt: new Date().toISOString(),
      },
      { status: 404 }, // Recommended to return a proper status code
    );
    throw new Error({ message: "Uknown error", error });
  }
}
