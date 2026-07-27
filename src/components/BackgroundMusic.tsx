"use client";

import { useEffect, useRef } from "react";

type Props = {
  videoId: string;
  playing: boolean;
};

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement | string,
        opts: {
          videoId: string;
          playerVars?: Record<string, string | number>;
          events?: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
      PlayerState?: { PLAYING: number; ENDED: number };
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

type YTPlayer = {
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};

function loadApi(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.YT?.Player) return Promise.resolve();

  return new Promise((resolve) => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      previous?.();
      resolve();
    };

    if (!document.getElementById("yt-iframe-api")) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      document.head.appendChild(tag);
    }
  });
}

export default function BackgroundMusic({ videoId, playing }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const wantPlayRef = useRef(playing);

  useEffect(() => {
    wantPlayRef.current = playing;
    if (!readyRef.current || !playerRef.current) return;
    if (playing) playerRef.current.playVideo();
    else playerRef.current.pauseVideo();
  }, [playing]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      await loadApi();
      if (cancelled || !hostRef.current || !window.YT?.Player) return;

      playerRef.current = new window.YT.Player(hostRef.current, {
        videoId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          modestbranding: 1,
          playsinline: 1,
          rel: 0,
          loop: 1,
          playlist: videoId,
        },
        events: {
          onReady: (e) => {
            readyRef.current = true;
            if (wantPlayRef.current) e.target.playVideo();
          },
          onStateChange: (e) => {
            // Restart when ended (extra safety beyond playlist loop)
            if (e.data === window.YT?.PlayerState?.ENDED) {
              e.target.playVideo();
            }
          },
        },
      });
    })();

    return () => {
      cancelled = true;
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
      readyRef.current = false;
    };
  }, [videoId]);

  return (
    <div className="yt-bg" aria-hidden>
      <div ref={hostRef} className="yt-bg-player" />
    </div>
  );
}
