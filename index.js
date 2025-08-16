const video = require("@google-cloud/video-intelligence");
const { Firestore } = require("@google-cloud/firestore");

const client = new video.v1p3beta1.VideoIntelligenceServiceClient();
const firestore = new Firestore();

/**
 * # moderateVideo
 *
 * @author Rahul
 * @last_modified_date 2025-08-16
 *
 * **Complexity**: Medium
 *
 * **Description**:
 * - Takes a GCS bucket + video file
 * - Runs Google Cloud Video Intelligence API explicit content detection
 * - Determines moderation status (approved / rejected / needs_manual_review)
 * - Updates Firestore with result
 *
 * @param {string} bucketName - GCS bucket name
 * @param {string} fileName - GCS video file name
 */
async function moderateVideo(bucketName, fileName) {
  console.log(`Processing file: ${fileName}`);

  const gcsUri = `gs://${bucketName}/${fileName}`;
  const videoId = fileName.split(".")[0];

  const request = {
    inputUri: gcsUri,
    features: ["EXPLICIT_CONTENT_DETECTION"],
  };

  try {
    const [operation] = await client.annotateVideo(request);
    console.log("Waiting for operation to complete...");
    const [operationResult] = await operation.promise();

    const annotationResults = operationResult.annotationResults[0];
    const explicitAnnotations = annotationResults.explicitAnnotation;

    let highestLikelihood = "VERY_UNLIKELY";

    explicitAnnotations.frames.forEach((frame) => {
      if (frame.pornographyLikelihood > likelihoodToNumber(highestLikelihood)) {
        highestLikelihood = numberToLikelihood(frame.pornographyLikelihood);
      }
    });

    // --- Decision Logic ---
    let status = "approved";
    if (highestLikelihood === "VERY_LIKELY" || highestLikelihood === "LIKELY") {
      status = "rejected";
    } else if (highestLikelihood === "POSSIBLE") {
      status = "needs_manual_review";
    }

    console.log(`Video ${videoId} status set to: ${status}`);

    const videoRef = firestore.collection("videos").doc(videoId);
    await videoRef.set({ moderationStatus: status }, { merge: true });
  } catch (err) {
    console.error("ERROR:", err);
    const videoRef = firestore.collection("videos").doc(fileName.split(".")[0]);
    await videoRef.set(
      { moderationStatus: "error", errorDetails: err.message },
      { merge: true }
    );
  }
}

function likelihoodToNumber(likelihood) {
  const map = {
    VERY_UNLIKELY: 0,
    UNLIKELY: 1,
    POSSIBLE: 2,
    LIKELY: 3,
    VERY_LIKELY: 4,
  };
  return map[likelihood] || 0;
}

function numberToLikelihood(number) {
  const map = {
    0: "VERY_UNLIKELY",
    1: "UNLIKELY",
    2: "POSSIBLE",
    3: "LIKELY",
    4: "VERY_LIKELY",
  };
  return map[number] || "VERY_UNLIKELY";
}

(async () => {
  const bucket = "your-bucket-name";
  const file = "your-video-file.mp4";
  await moderateVideo(bucket, file);
})();
