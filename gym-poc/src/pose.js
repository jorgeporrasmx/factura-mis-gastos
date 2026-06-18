// pose.js
// Capa de captura: cámara + modelo de pose MediaPipe (BlazePose) corriendo
// 100% en el dispositivo (el video NUNCA sale del celular).
// Carga el modelo desde CDN; en producción se autoaloja para no depender de él.

import {
  PoseLandmarker,
  FilesetResolver,
  DrawingUtils,
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14";

const WASM_PATH =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
// "lite" para móviles; "full"/"heavy" dan más precisión a costa de FPS.
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";

export class PoseSource {
  constructor(videoEl, canvasEl) {
    this.video = videoEl;
    this.canvas = canvasEl;
    this.ctx = canvasEl.getContext("2d");
    this.landmarker = null;
    this.drawer = new DrawingUtils(this.ctx);
    this.running = false;
    this.lastVideoTime = -1;
    this.onResults = null; // callback(landmarks|null, timestampMs)
  }

  async init() {
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
    this.landmarker = await PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
      runningMode: "VIDEO",
      numPoses: 1,
      minPoseDetectionConfidence: 0.5,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
  }

  async startCamera() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false,
    });
    this.video.srcObject = stream;
    await this.video.play();
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    this.running = true;
    requestAnimationFrame(() => this._loop());
  }

  stop() {
    this.running = false;
    const stream = this.video.srcObject;
    if (stream) stream.getTracks().forEach((t) => t.stop());
    this.video.srcObject = null;
  }

  _loop() {
    if (!this.running) return;
    const now = performance.now();
    if (this.video.currentTime !== this.lastVideoTime && this.landmarker) {
      this.lastVideoTime = this.video.currentTime;
      const result = this.landmarker.detectForVideo(this.video, now);
      const landmarks = result.landmarks?.[0] || null;
      this._draw(landmarks);
      if (this.onResults) this.onResults(landmarks, now);
    }
    requestAnimationFrame(() => this._loop());
  }

  _draw(landmarks) {
    const { ctx, canvas } = this;
    ctx.save();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (landmarks) {
      this.drawer.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS, {
        color: "#22d3ee",
        lineWidth: 4,
      });
      this.drawer.drawLandmarks(landmarks, { color: "#f472b6", radius: 5 });
    }
    ctx.restore();
  }
}
