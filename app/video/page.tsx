"use client";

import React from "react";
import YouTubePlayer from "./YouTubePlayer";

// In a perfect world, this is not hosted on youtube and we've implemented a more robust system to say...
// Maybe display a list of thumbnails/videos in some sort of library where we can dynamically select a video on demand
// onVideoSelect ship the captioning to the client and stream the video - sync the two at 0

const VideoPlayer = () => {
  return <YouTubePlayer videoId={"yp1vkTW3fxI"} />;
};

export default VideoPlayer;
