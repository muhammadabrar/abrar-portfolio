"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { site } from "@/content/site";

export function IntroVideo({
  className = "mt-14",
}: {
  className?: string;
}) {
  const video = site.introVideo;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  if (!video) return null;

  const hasLocal = Boolean(video.src);
  const hasYouTube = Boolean(video.youtubeId);

  async function startPlayback() {
    if (!videoRef.current) return;
    try {
      await videoRef.current.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }

  return (
    <section className={className} data-reveal>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="section-label mb-0">{video.title}</h2>
          {video.description ? (
            <p className="mt-2 max-w-lg text-[color:var(--muted)]">{video.description}</p>
          ) : null}
        </div>
        <p className="text-sm text-[color:var(--muted)]">
          {Math.round(video.durationSec / 60)}:
          {String(video.durationSec % 60).padStart(2, "0")} min
        </p>
      </div>

      <div className="intro-video">
        {hasYouTube && !hasLocal ? (
          <iframe
            className="intro-video-frame"
            src={`https://www.youtube-nocookie.com/embed/${video.youtubeId}?rel=0`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              className="intro-video-frame"
              src={video.src}
              poster={video.poster}
              controls={playing}
              playsInline
              preload="metadata"
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            >
              Your browser does not support embedded video.
            </video>

            {!playing && (
              <button
                type="button"
                className="intro-video-play"
                onClick={startPlayback}
                aria-label="Play intro video"
                disabled={!hasLocal}
              >
                <span className="intro-video-play-icon" aria-hidden>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5.14v13.72a1 1 0 0 0 1.5.86l11-6.86a1 1 0 0 0 0-1.72l-11-6.86A1 1 0 0 0 8 5.14Z" />
                  </svg>
                </span>
                <span className="intro-video-play-label">
                  {hasLocal ? "Play intro" : "Add video file to enable playback"}
                </span>
              </button>
            )}

            {!playing && (
              <div className="intro-video-poster" aria-hidden>
                <Image
                  src={video.poster}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 720px"
                  priority={false}
                />
                <div className="intro-video-poster-fade" />
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
