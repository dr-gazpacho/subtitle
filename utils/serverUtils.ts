import { put, list, del } from "@vercel/blob";

/**
 * looks into vercel blob storage to get the transcript and returns it
 * @param videoId youtube id, also using this as file name prefix in blob storage
 * @returns transcript as json
 */
export const getTranscript = async <T>(videoId: string): Promise<T | null> => {
  try {
    // search for matching blob in blob storate
    const { blobs } = await list({ prefix: `transcripts/${videoId}` });

    // first match is only match
    const blob = blobs[0];

    if (!blob) return null;

    const response = await fetch(blob.url, { cache: "no-store" });
    return (await response.json()) as T;
  } catch (err) {
    console.error("Blob Read Error:", err);
    return null;
  }
};

/**
 * deletes all other instances of the blog then saves it - probably dangerous.. need to rethink this
 * vercel is adding a random suffix, so i assume when i "save" itll add a new random suffix, need to test later
 * @param videoId youtube id, also using this as file name prefix in blob storage
 * @returns transcript as json
 */
export const saveTranscript = async <T>(
  videoId: string,
  data: T,
): Promise<void> => {
  try {
    const prefix = `transcripts/${videoId}`;

    // clean up old versions first so the "first" one found is always the newest
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
    throw new Error(`Failed to save transcript with error: ${errorMessage}`);
  }
};
