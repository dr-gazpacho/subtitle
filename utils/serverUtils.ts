import { put, list, del } from "@vercel/blob";
import { promises as fs } from "fs";
import path from "path";

/**
 * verifies if a given error is a Node.js-specific System Error and can be handled as such
 * allows safe access to the 'code' property (e.g., 'ENOENT') for file system operations
 * @param error - caught error object, typically typed as 'unknown'
 * @returns boolean, true if the error is a valid NodeJS.ErrnoException
 */
const isNodeError = (error: unknown): error is NodeJS.ErrnoException => {
  return error instanceof Error && "code" in error;
};

/**
 * strategy A: vercel blob storage
 */
const blobStorage = {
  /**
   * looks into vercel blob storage to get the transcript and returns it
   * @param videoId youtube id, also using this as file name prefix in blob storage
   * @returns transcript as json
   */
  get: async <T>(videoId: string): Promise<T | null> => {
    try {
      // search for matching blob in blob storage
      const { blobs } = await list({ prefix: `transcripts/${videoId}` });

      // first match is only match for this implementation, safe to hardcode it like this for now
      const blob = blobs[0];

      if (!blob) return null;

      // explicity tell next not to cache so we can have confidence we're fetching/returning the lasted version
      const response = await fetch(blob.url, { cache: "no-store" });
      if (!response.ok) throw new Error(`Fetch failed: ${response.status}`);

      return (await response.json()) as T;
    } catch (err) {
      console.error("Blob Read Error:", err);
      return null;
    }
  },

  /**
   * deletes all other instances of the blob in storage then saves this one
   * @param videoId youtube id, also using this as file name prefix in blob storage
   * @returns transcript as json
   */
  save: async <T>(videoId: string, data: T): Promise<void> => {
    try {
      const prefix = `transcripts/${videoId}`;

      // clean up old versions first so the "first" one found is always the newest
      // creating new and deleting old  versions of the transcript (both with new suffixes) should ensure we don't fetch a cached version from a CDN
      const { blobs } = await list({ prefix });
      if (blobs.length > 0) {
        await del(blobs.map((b) => b.url));
      }

      await put(`${prefix}.json`, JSON.stringify(data, null, 2), {
        access: "public",
        addRandomSuffix: true,
        contentType: "application/json",
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      throw new Error(`Failed to save transcript to Blob: ${errorMessage}`);
    }
  },
};

/**
 * strategy B: local file system (lets you run the app locally without needing to set up with vercel/my blob store)
 */
const fileStorage = {
  /**
   * method to fetch a transcript from the file system
   * @param videoId unique string to correlate video to transcript
   * @returns null or the transcript object
   */
  get: async <T>(videoId: string): Promise<T | null> => {
    try {
      const filePath = path.join(process.cwd(), "data", `${videoId}.json`);
      const fileContents = await fs.readFile(filePath, "utf8");
      return JSON.parse(fileContents) as T;
    } catch (err: unknown) {
      if (isNodeError(err) && err.code === "ENOENT") {
        console.warn(`Transcript not found for ID: ${videoId}`);
        return null;
      }
      console.error("FileSystem Read Error:", err);
      throw new Error("Internal Server Error reading transcript");
    }
  },

  /**
   * Saves a transcript object to the file system as a JSON file.
   * @param videoId The ID used to name the file (e.g., [videoId].json)
   * @param data The transcript object to be stringified and saved
   */
  save: async <T>(videoId: string, data: T): Promise<void> => {
    try {
      const dataDir = path.join(process.cwd(), "data");
      const filePath = path.join(dataDir, `${videoId}.json`);

      // ensure the data directory exists before trying to write
      await fs.mkdir(dataDir, { recursive: true });

      // stringify with 2-space indentation to keep the JSON readable
      const fileContents = JSON.stringify(data, null, 2);
      await fs.writeFile(filePath, fileContents, "utf8");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error(`FileSystem Write Error for ${videoId}:`, err);
      throw new Error(`Failed to save transcript locally: ${errorMessage}`);
    }
  },
};

/**
 * strategy imlpementation:
 * overly implements some polymorphism logic to decide which storage stragegy to export
 * defaults to local storage if in dev mode AND there's no vercel env variables
 */
const isDev = process.env.NODE_ENV === "development";
const hasVercelToken = !!process.env.BLOB_READ_WRITE_TOKEN;
const useLocal = isDev && !hasVercelToken;

if (useLocal) {
  console.warn(
    "⚠️  Vercel Blob token not found. Falling back to local FileSystem storage.",
  );
}

export const getTranscript = useLocal ? fileStorage.get : blobStorage.get;
export const saveTranscript = useLocal ? fileStorage.save : blobStorage.save;
