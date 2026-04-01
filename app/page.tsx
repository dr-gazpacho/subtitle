"use client";

import React from "react";
import dynamic from "next/dynamic";

// was getting some hydration errors - server rendered version of the app had mismatch from client
// afaik this tells Next.js: "do NOT render this on the server; just render the loading component until the browser takes over."
const YouTubePlayer = dynamic(() => import("@/components/YouTubePlayer"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center gap-4">
      <p>Loading...</p>
    </div>
  ),
});

export default function Home() {
  const videoId = "yp1vkTW3fxI"; // or from params

  return (
    <main>
      <YouTubePlayer videoId={videoId} />
    </main>
  );
}
