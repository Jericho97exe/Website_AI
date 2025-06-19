import Hls from 'hls.js';
import { useEffect, useRef } from 'react';

interface LiveStreamProps {
  cameraId: string;
}

export default function LiveStream({ cameraId }: LiveStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let hls: Hls | null = null;
    
    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(`http://localhost:8000/live/${cameraId}/index.m3u8`);
      hls.attachMedia(video);
      
      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().catch((error) => {
          console.error('Error al reproducir video:', error);
        });
      });
    } 
    // Soporte para navegadores que soportan HLS nativamente (como Safari)
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = `http://localhost:8000/live/${cameraId}/index.m3u8`;
      video.addEventListener('loadedmetadata', () => {
        video.play().catch((error) => {
          console.error('Error al reproducir video:', error);
        });
      });
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [cameraId]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      style={{ width: '100%' }}
      playsInline
    />
  );
}