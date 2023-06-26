import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useRecording } from "./contexts/recording";
import { useStreams } from "./contexts/streams";

import styles from "./PiPWindow.module.scss";

const PiPWindow = () => {
  const {
    isRecording,
    isPaused,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
  } = useRecording();

  const { cameraStream, screenshareStream } = useStreams();

  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const videoElement = videoRef.current;
  if (cameraStream && videoElement) {
    videoElement.srcObject = cameraStream;
  }

  useEffect(() => {
    const requestPipWindow = async () => {
      return await (window as any).documentPictureInPicture.requestWindow({
        width: 300,
        height: 300,
      });
    };

    if (screenshareStream && containerRef.current) {
      const pipWindow = requestPipWindow();
      pipWindow.then((window) => {
        const allCSS = [...document.styleSheets]
          .map((styleSheet) =>
            [...styleSheet.cssRules].map((r) => r.cssText).join("")
          )
          .filter(Boolean)
          .join("\n");
        const style = document.createElement("style");
        style.textContent = allCSS;
        window.document.head.appendChild(style);

        window.document.body.append(containerRef.current);

        window.document
          .querySelector("#startRecording")
          .addEventListener("click", startRecording);

        window.document
          .querySelector("#stopRecording")
          .addEventListener("click", stopRecording);
      });
    }
  }, [screenshareStream, startRecording, stopRecording]);

  return createPortal(
    <div className={styles.container} ref={containerRef}>
      <video
        className={styles.camera}
        autoPlay
        playsInline
        muted
        controls={false}
        ref={videoRef}
      />
      <div className={styles.toolbar}>
        <button id="startRecording" disabled={isRecording}>
          Start
        </button>
        <button id="stopRecording" disabled={!isRecording}>
          Stop
        </button>
        <button onClick={pauseRecording} disabled={!isRecording || isPaused}>
          Pause
        </button>
        <button onClick={resumeRecording} disabled={!isRecording || !isPaused}>
          Resume
        </button>
      </div>
    </div>,
    document.body
  );
};

export default PiPWindow;
