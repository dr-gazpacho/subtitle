import { NextResponse } from "next/server";
import { getTranscript, saveTranscript } from "@/utils/serverUtils";
import { SpeechmaticsBatchResponse } from "@/data/types";

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

    // transcript variable will explicitly be null if no transcript exists in file system
    const transcript = await getTranscript<SpeechmaticsBatchResponse>(videoId);

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
  } catch {
    return NextResponse.json(
      {
        id: null,
        transcript: `An unknown error occured}`,
        createdAt: new Date().toISOString(),
      },
      { status: 404 }, // Recommended to return a proper status code
    );
  }
}

import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  // next 15+ made some methods asynchronous for internal optiization - handle params as promise
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { oldName, newName } = await request.json();

  // 1. Fetch your existing transcript (from your DB or file system)
  // For now, let's assume you fetch it based on params.videoId
  // transcript variable will explicitly be null if no transcript exists in file system
  const transcript = await getTranscript<SpeechmaticsBatchResponse>(videoId);

  // 2. Perform a deep "find and replace" on the speaker names
  // This is a simple way to swap names in a JSON blob string
  const updatedTranscriptString = JSON.stringify(transcript).replaceAll(
    `"speaker":"${oldName}"`,
    `"speaker":"${newName}"`,
  );

  const updatedTranscript = JSON.parse(updatedTranscriptString);

  // 3. Save the updated version back to your storage
  await saveTranscript(params.videoId, updatedTranscript);

  // 4. Return the new object so the client can update its state
  return NextResponse.json(updatedTranscript);
}
