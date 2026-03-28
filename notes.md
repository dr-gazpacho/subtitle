**Notes to a Future Me**

I'm imagining this project as a demo of how I operate in the real world. Documenting ideas, choices, and justifications here for the benefit of posterity.

Chosing NextJS as framework for a few reasons:

- [Speechmatics notes](https://docs.speechmatics.com/) that they will be supporting "real time transcription with NextJS" in their docs. There is no indication that this project would need something like this, but it's nice to have a short bridge to new opportunites and reduce the engineering overhead to get there.
- A web-based interface accessible to a web browser seems ideal - I imagine the target consumer of this media will watch on an internet-enabled device with a web browswer as opposed to using a discrete, dedicated streaming application.
- NextJS offers fullstack out of the box - I feel it's practical to scaffold a small application in one place to minimize complexity. This is knowing there are probably much more sophisticated and efficient strategies for encoding, streaming, etc. but for the sake of the project, I am going to solve the problem at hand first.
- Hosting with Vercel on the hobby plan is free and easy - easy to share deployed application and can focus on implementation details rather than infrastructure details

**Development**

- Read the docs to get a sense of where I am, have never worked with speechmatics/video/subtitles like this, I've only burned them into a short film with Blender
- Planning to host on Vercel, used Gemini to get quick scaffolding for API endpoint to serve video
- FUTURE TO DO: if this works, could make this a little more flexible by assigning IDs to videos and fetching/streaming from larger file system, right now just hardcoded to one video
