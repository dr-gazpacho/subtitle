import { NextResponse } from "next/server";
import { getTranscript, saveTranscript } from "@/utils/serverUtils";
import { SpeechmaticsBatchResponse } from "@/types/types";

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
        transcript: `An unknown error occured`,
        createdAt: new Date().toISOString(),
      },
      { status: 404 }, // Recommended to return a proper status code
    );
  }
}

export async function PUT(
  request: Request,
  // next 15+ made some methods asynchronous for internal optiization - handle params as promise
  { params }: { params: Promise<{ videoId: string }> },
) {
  const { videoId } = await params;

  if (!videoId) {
    throw new Error("Missing videoId from request");
  }

  const { oldName, newName } = await request.json();

  const transcript = await getTranscript<SpeechmaticsBatchResponse>(videoId);

  if (!oldName || !newName) {
    if (transcript) {
      return NextResponse.json(transcript);
    } else {
      return NextResponse.json(
        {
          id: null,
          transcript: `Transcript was not updated with speaker names, transcript not found`,
          createdAt: new Date().toISOString(),
        },
        { status: 404 }, // Recommended to return a proper status code
      );
    }
  }

  // simple find and replace all - trusts the accuracy of the transcript
  // narrow use case, so narrow function seems fine
  const updatedTranscriptString = JSON.stringify(transcript).replaceAll(
    `"speaker":"${oldName}"`,
    `"speaker":"${newName}"`,
  );

  const updatedTranscript = JSON.parse(updatedTranscriptString);

  await saveTranscript(videoId, JSON.parse(updatedTranscriptString));

  return NextResponse.json(updatedTranscript);
}
