import { promises as fs } from "fs";
import path from "path";

/**
 * method to fetch a transcript from the file system - granted there is only one for this exercise,
 * but the general hypopthetical this imagines is that video and transcripts are stored separate and we can correlate them somehow
 * @param videoId unique string to correlate video to transcript, currently just using the YouTube id
 * @returns null or the speechmatics transcript object
 */
export const getTranscript = async <T>(videoId: string): Promise<T | null> => {
  try {
    const filePath = path.join(process.cwd(), `data/${videoId}.json`);

    try {
      const fileContents = await fs.readFile(filePath, "utf8");
      return JSON.parse(fileContents);
    } catch (err: unknown) {
      // stackoverflow notes this is the interface to use for Node errors
      const error = err as NodeJS.ErrnoException;
      // minimal handle of "no transcript in file system" - but a hypothetically realistic scenario
      if (error.code === "ENOENT") {
        console.warn(`Transcript not found for ID: ${videoId}`);
        return null; // returning null to keep the rest of this moving
      }

      // It is unrealiztic I'll hit this fallback error during this exercise
      console.error("FileSystem Error:", error);
      throw new Error("Internal Server Error reading transcript");
    }
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;
    throw new Error("Missing videoId from request", { cause: error });
    return null;
  }
};

/**
 * Saves a transcript object to the file system as a JSON file.
 * @param videoId The ID used to name the file (e.g., [videoId].json)
 * @param data The transcript object to be stringified and saved
 */
export const saveTranscript = async <T>(
  videoId: string,
  data: T,
): Promise<void> => {
  if (!videoId) {
    throw new Error("Missing videoId: Cannot save transcript without an ID.");
  }

  try {
    const dataDir = path.join(process.cwd(), "data");
    const filePath = path.join(dataDir, `${videoId}.json`);

    // stringify with 2-space indentation to keep the JSON readable
    const fileContents = JSON.stringify(data, null, 2);

    await fs.writeFile(filePath, fileContents, "utf8");

    console.log(`Successfully updated transcript for ID: ${videoId}`);
  } catch (err: unknown) {
    const error = err as NodeJS.ErrnoException;

    // handle specific file system permissions errors (EACCES) or similar
    console.error(`FileSystem Write Error for ${videoId}:`, error);
    throw new Error(`Failed to save transcript: ${error.message}`);
  }
};
