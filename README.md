# Google Cloud Video Moderation with Firestore

This project demonstrates how to use Google Cloud Video Intelligence API to automatically moderate videos for explicit content.  
Results are stored in Firestore, marking videos as `approved`, `rejected`, or `needs_manual_review`.

## Features

- Uses Video Intelligence API (EXPLICIT_CONTENT_DETECTION)
- Converts likelihood values (VERY_UNLIKELY → VERY_LIKELY) into moderation decisions
- Updates moderation status in Firestore
- Handles errors gracefully and logs results

## Tech Stack

- Node.js
- Google Cloud Video Intelligence API
- Firestore (NoSQL database)

## Repo Structure

```
video-moderation-gcp/
│── index.js          # main script
│── package.json      # dependencies
│── README.md         # docs
```

## Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/your-username/video-moderation-gcp.git
cd video-moderation-gcp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Google Cloud Credentials

Export your service account key:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="path/to/key.json"
```

Enable required APIs:

```bash
gcloud services enable videointelligence.googleapis.com firestore.googleapis.com
```

### 4. Run Example

```bash
node index.js
```

## Future Improvements

- Add Cloud Function trigger when video is uploaded to GCS
- Store frame-level insights for analytics
- Add Slack/Email notifications when a video is rejected

Author: Rahul  
Last Updated: 16 Aug 2025
