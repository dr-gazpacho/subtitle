import { SpeechmaticsBatchResponse } from "@/data/types";
import { promises as fs } from "fs";
import path from "path";

/**
 * method to fetch a transcript from the file system - granted there is only one for this exercise,
 * but the general hypopthetical this imagines is that video and transcripts are stored separate and we can correlate them somehow
 * @param videoId unique string to correlate video to transcript, currently just using the YouTube id
 * @returns null or the speechmatics transcript object
 */
export const getTranscript = async (
  videoId: string,
): SpeechmaticsBatchResponse | null => {
  try {
    const filePath = path.join(process.cwd(), `data/${videoId}.json`);

    try {
      const fileContents = await fs.readFile(filePath, "utf8");
      return JSON.parse(fileContents);
    } catch (error: unknown) {
      // minimal handle of "no transcript in file system" - but a hypothetically realistic scenario
      if (error.code === "ENOENT") {
        console.warn(`Transcript not found for ID: ${videoId}`);
        return null; // returning null to keep the rest of this moving
      }

      // It is unrealiztic I'll hit this fallback error during this exercise
      console.error("FileSystem Error:", error);
      throw new Error("Internal Server Error reading transcript");
    }

    return JSON.parse(fileContents);
  } catch (error) {
    throw new Error({ message: "Missing videoId from request", error });
    return null;
  }
};
