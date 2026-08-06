import React, { useEffect, useRef } from "react";
import { useI18n } from "../i18n";
import { assetUrl } from "../lib/assetUrl";
import { useReducedMotion } from "../lib/useReducedMotion";

export default function CaseMedia({ image, video, videoWebm, title, className = "" }) {
  const { t } = useI18n();
  const videoRef = useRef(null);
  const figureRef = useRef(null);
  const reduced = useReducedMotion();
  const label = `${title} — ${t.a11y.casePreview}`;
  const poster = assetUrl(image);
  const mp4 = assetUrl(video);
  const webm = assetUrl(videoWebm);

  useEffect(() => {
    const node = figureRef.current;
    const media = videoRef.current;
    if (!node || !media || reduced) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (media.readyState < 2) media.load();
          media.play().catch(() => {});
        } else {
          media.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [mp4, reduced]);

  return (
    <figure
      className={`case-media ${className}`}
      ref={figureRef}
      style={mp4 ? { "--case-poster": `url(${poster})` } : undefined}
    >
      {mp4 && !reduced ? (
        <video
          ref={videoRef}
          className="case-media-el"
          poster={poster}
          muted
          loop
          playsInline
          preload="none"
          aria-label={label}
        >
          <source src={mp4} type="video/mp4" />
          {webm ? <source src={webm} type="video/webm" /> : null}
        </video>
      ) : (
        <img className="case-media-el" src={poster} alt={label} loading="lazy" />
      )}
    </figure>
  );
}
