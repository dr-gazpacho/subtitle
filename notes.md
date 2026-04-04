**Notes to a Future Me**

I'm imagining this project as a demo of how I operate in the real world. Documenting ideas, choices, and justifications here for the benefit of posterity.

Chosing NextJS as framework for a few reasons:

- [Speechmatics notes](https://docs.speechmatics.com/) that they will be supporting "real time transcription with NextJS" in their docs. There is no indication that this project would need something like this, but it's nice to have a short bridge to new opportunites and reduce the engineering overhead to get there.
- A web-based interface accessible to a web browser seems ideal - I imagine the target consumer of this media will watch on an internet-enabled device with a web browswer as opposed to using a discrete, dedicated streaming application.
- NextJS offers fullstack out of the box - I feel it's practical to scaffold a small application in one place to minimize complexity. This is knowing there are probably much more sophisticated and efficient strategies for encoding, streaming, etc. but for the sake of the project, I am going to solve the problem at hand first.
- Hosting with Vercel on the hobby plan is free and easy - easy to share deployed application and can focus on implementation details rather than infrastructure details

**Development**

## feat-video-playback

- Read the docs to get a sense of where I am, have never worked with speechmatics/video/subtitles like this, I've only burned them into a short film with Blender
- Planning to host on Vercel, used Gemini to get quick scaffolding for API endpoint to serve video
- FUTURE TO DO: if this works, could make this a little more flexible by assigning IDs to videos and fetching/streaming from larger file system, right now just hardcoded to one video
- Update that the file is too big for git hub, exploring Vercel Blob storage - seems as though I can host video of city council meetings as they are offically public
- Blob storage seems fine, but overall experience is SLOW - not sure this is the best. unable to manually advance playhead
- Went over the limit for free self-hosting, going to try to host on youtube and use iframe

## feat-youtube-pivot

- Hit Vercel's storage limits, so trying to host the video elsewhere and get the video processessing handled out of the box. I think I can access timestamps with the iframe and move the playhead with something on vimeo or youtube, we'll find out
- Using a react/youtube libary to simplify interacting with the video - hardcoding a video id into the player, leaving a note re: future
- Used some Gemini to build out interface for some props not fully exposed by the library
- Generally updated some comments and notes, removed the code that would try and stream video from Vercel Blob

## feat-fetch-transcript

- much less unknown than the video streaming
- set up API endpoint to fetch json from the file system
- will use HTTP methods to determine whether we update speaker name or just fetch
- set up a generic fetch method for the frontend to use

## feat-sync

- might be throw away code, going to try to implement something where I can just correlate the playhead on the video with a given word from the transcript
- adding a small `tsc` command to run so I can catch more transpilation errors as I work
- the nested async in the useEffect felt gross, did some reading and switched to tanstack router, seems popular amongst next power users
- added a pretty brutal handler for the unformatted transcript - set a polling loop to get current time off the player, loop through words and get index of word who's start and end time wraps the current time from the player
- switching to tanstack router brought in some hydration error (server DOM was different from client DOM) -> added "dynamic" import for YouTubePlayer and stopped it from rendering on server

## feat-format

- right now everything word of the transcript is chucked onto the DOM in a giant pile with no puntuation, formatting, or concept of the speakers name, I'm going to try to preserve this current functionality in a nicer format. goal is to chunk text together per chunk from a given speaker (with punctuation)
- updated method that simplifieds transcript data - shout out to Robert Nystrom and his notes on using lookahead during tokenization, implemented a pretty informal verion to map punctuation
- note for future me: skipped to end of video (multiple, simultanous voices say "Aye") and seems that the transcript separates them into discrete voices at discrete times - not sure what the right strategy is: render transcript completely and allow small edge cases like this? Or dig in and try to handle "simultanous speech"
- add a nested formatter and render the transcript a little differently - groups things by "speaking turn" but keeps a connection back to the old index/lookup strategy

## feat-scroll

- just adding "scroll into view" logic - will defer on implementing search, will need to "disable scroll" while searching
- scroll isn't perfect programatically but I think it works - I'm scrolling on the basis of index, so the viewport will scroll to each word even when they're on the same line. You cannot see the scroll, but programatically it is probably happening. If it works like I think it works. it's a trivial amount of wasted computation, but still wasted

## feat-search

- I don't have a great idea for a UI for the search element, so I am going to create a new component that can show the transcript independely of the live scrolling transcript but offer the same sorts of onClick features
- I sort of have a sliding window working for the word/phrase search but the scroll effect in the transcript pulls focus

## feat-speaker-tag

- I think tanstack router is overkill for this project, so I'm taking it out and just sticking with the NextJS recommended implementation of fetch; I'm not really doing a multip page/multi route/huge API - in the hypothetical world where this application would grow, anyone could come in and tailor a more robust implementation of a router to suit the project needs
- did a very small refactor - considering a larger one to break up this monolithic component - I'm right on the edge of too much state in one place but not certain this is big enough to merit something like zustand or redux
- I'm gonna add MUI - there's a lot of nice elements and accessibility I want to get for free from their components - will defer refactor on the other components for a little bit, maybe I can get a nicer scoll effect with it
- I'm just writing to the json in the file system - not scalable for something larger but persistent storage/metadata tagging seems like a deeper, separate concern
- MUI makes for a nice looking UI and mine currently looks terrible but everything WORKS - beautify this later, maybe create a drawer that slides over the video and transcript that allows you to search and/or edit speaker tags. done for now, but not done

## feat-speaker-tag

- jk learned the hard way file storage with vercel is read only when it's deployed, going to go back to blob storage but only for this json
- setting up private blob storage, i was able to pull env variables: `vercel link && vercel env pull`
- pushed blog: `vercel blob put ./data/yp1vkTW3fxI.json --pathname transcripts/yp1vkTW3fxI.json --add-random-suffix false --access private`
- two hours of missed blob storage later and I think it works

## feat-mui

- going to add a nice frontend component library and keep tailwind in the background; I think this will help my code be more visually readable and will give the app a more comprehensive design langugae for free
- two birds with one stone to start, updated the TranscriptView (element that shows the transcript and highlights the current word being spoken) to use MUI and implemented a fix to make the transcript scroll nicely
  -- used some Gemini to fine tune the scroll effect, knew I needed to target the content in the container specifically but used the LLM to iterate through strategies and help implement the current scroll effect
- dropping tailwind out and just using MUI - if I wanted to build my own components from scratch, then I'd stick with tailwind; here it's not adding a ton of value/readability and I don't need tne control
- dropped some already written components into gemini for a quick translate over to MUI

## feat-ui-updates

- added small gradient mask to the transcript
- if video is paused, clicking on a word start the video playing again
- updated transcript search to feel a little nicer
  -- added timestamp to each result
  -- added some height and scroll effects on the container
  -- added pagination because the infinitely scrollable list was not ideal

## feat-quality-of-life

- the get and save methods for the transcript are good candidates for a little strategy pattern. I replaced the function bodies when I moved from local storage to blob storage, but kept the same function signature. I don't think that someone else developing/running this app locally would be able to `vercel link` to my blob store. Considering I've already tried to encapsulate the getting/saving logic into it's own function, I can re-implement my local storage solution and wrap it and blob storage in a strategy so select which method to use at runtime
- adding a little header to navigate back and forth between the transcript/video component and the "about" page (instructions)

## future

[x] keyword/phrase search
[x] update speaker tag
improvements
[x] implement MUI
[x] handle weird interaction with scroll - scroll pulls focus from search
[x] maybe scrolling the page is the wrong thing and i need to scroll the content itself within the container
[x] ~~disable scroll when search is active~~ only scrolling the sub container with the transcript solved this
[x] reduce size of "speaking turn" in search window - maybe only show partials
[x] show timestamp near Speaker's name for the start of a given "speaking turn"
[x] store each "speaking turn" that matches search criteria in array, create next/back buttons to move through all possible matches for term(s), show timestamps (forgot the word for pagination)
[x] ~~build drawer that contains the speaker tag editing and phrase search~~ desktop UI got rearranged and is OK, though this is not optimised for a phone or tablet, would need to reconsider the entire UI
stretch
[ ] stretch - move components, only need default page and an "about" page (maybe a better name is "instructions" or "how to")
[ ] stretch - bookmark a timestamp "onWordClick"
