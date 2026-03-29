import { SpeechmaticsBatchResponse } from "@/data/types";
import { promises as fs } from "fs";
import path from "path";

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
