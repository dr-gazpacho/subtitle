# SyncScript

> **Interactive Video Intelligence.**

SyncScript is a NextJS web application that syncronizes AI-generated transcripts with their corresponding video source. A user may search for a word or phrase within the transcript, update speaker tags, and view the live transcript along side a playing video. Clicking a given word in the transcript will advance the video playback to the corresponding time.

---

## Installation and Setup

### Prerequisites

- **Node.js** (v18.x or later, developed with 24.14.0)
- **npm** or **yarn** (developed with npm)

### Installation & Execution

1.  **Install dependencies**
    ```bash
    npm install
    ```
2.  **Run dev server**
    ```bash
    npm run dev
    ```
3.  **Run comprehensive type check**
    ```bash
    npm run type
    ```

### Environment Variables & Blob Storage

> **Note:** This project uses Vercel's environment variables and link mechanism for access to blob storage during local development. Here, variables are managed via `vercel env pull`. Access to the production blob store is restricted to the project owner.
> I've implemented a strategy for non-owners to run the project locally, it is detailed below:

## 🏗 System Architecture & Data Strategy

### The Strategy Pattern (Local vs. Production)

You can run this app locally without credientials, I've implemented a strategy for local file-system transcript storage:

- **Production:** Transcripts are stored and retrieved from Vercel's blob storage. Mutations (like speaker renaming) are handled through Vercel's authentication methods
- **Local Development:** The app falls back to a **File System Strategy** when a local instance of the authentican token is not found. The application looks for JSON files in the `/data` directory mapped by `videoId`

### Working with Local Data

If you are running this project locally without the auth tokens in a local `.env` (which will be anyone who is reading this and is not me 🕊️):

1.  **Mock Data:** The app will look for a file named `[videoId].json` within the data directory. There is only one video in this project - so the `videoId` is hardcoded in the UI, but the application uses generic methods to GET and PUT data associated with a given `videoId`
2.  **Resetting State:** A `backupdata.json` is provided in the data directory alongside the `[videoId].json]`. If you have performed several "Rename Speaker" mutations and wish to return to the original state, simply overwrite your `[videoId].json` with the contents of the backup file or just drop changes from git

---

## 🏗 System Architecture

### Data Processing Pipeline

The application applies a layer of transformation to a Speechmatics transcript to extract relevant content and simplify the information:

1.  **`genericFetch`**: A standardized TypeScript wrapper for handling API responses and error states
2.  **`simplifyTranscript`**:
    - Extracts content, speaker IDs, and timestamps
    - Adds lookahead to format puncuation into the transcript; attaches punctuation to word preceeding it in the Speechmatics data
3.  **`formatTranscript`**:
    - Groups words into `TranscriptTurn` objects (which represent a given speaker's entire "speaking turn")
    - Keeps a `globalIndex` associated with each word to map a given word to a start time in the transcript (used to achieve onWordClick effects)

### Synchronization Logic

The app uses a `setInterval` (100ms) within a React `useEffect` to poll the YouTube Player state. It compares `playerRef.current.getCurrentTime()` against the `start` and `end` timestamps of the `words` array to update the `activeIndex` state, triggering a re-render of the highlighted text.

---

## 📖 User Guide

### 1. Speaker Tags, Video Player, and Transcript View Tryptych

- **Speaker Tags:** Displays all identified speakers, speakers all initialzed anonymously but uniquely. Use the edit feature to rename generic tags (e.g., change "S1" to "John Doe") across the entire document.
- **Center Player:** Standard YouTube controls. The transcript will follow the video automatically.
- **Transcript View:** The text scrolls to keep the active word in view. Click any word to "jump" the video to that spot.

### 2. Search & Discovery

The **Transcript Search** Type any phrase to see a list of matches. Clicking a result navigates both the video and the main transcript view to that exact point in time. Results are paginated by speaking turn, not per word match.

### 3. Navigation

Use the **SyncScript Header** to toggle between the main dashboard and the **About** page. The header is pinned to the top of the screen for easy access regardless of scroll depth.

### Development log

Development logs are available [here](notes.md) - all notes reflected in this document are also reflected by commit history when a given feature is merged into `main`
