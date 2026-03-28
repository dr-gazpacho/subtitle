"use client";

import React from "react";

const VideoPlayer = () => {
  const videoUrl = "/api/video";

  return (
    <div>
      <h1>My Video Stream</h1>
      <video controls width="600" preload="none" aria-label="Video player">
        <source src={videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
