"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Shot = { src: string; alt: string };

export function ProjectGallery({
  shots,
  title = "Gallery",
}: {
  shots: Shot[];
  title?: string;
}) {
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!shots.length) return null;

  const current = shots[active];

  const go = (index: number) => {
    setActive((index + shots.length) % shots.length);
  };

  useEffect(() => {
    if (!lightbox) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(active + 1);
      if (e.key === "ArrowLeft") go(active - 1);
    };

    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [lightbox, active]);

  return (
    <section className="mt-12" aria-label={title}>
      <div className="mb-5 flex items-end justify-between gap-3">
        <h2 className="section-label mb-0">{title}</h2>
        <p className="text-sm text-[color:var(--muted)]">
          {active + 1} / {shots.length}
        </p>
      </div>

      <div className="project-gallery">
        <div className="project-gallery-stage">
          <button
            type="button"
            className="project-gallery-main"
            onClick={() => setLightbox(true)}
            aria-label={`Open ${current.alt}`}
          >
            <Image
              src={current.src}
              alt={current.alt}
              fill
              className="project-gallery-main-img"
              sizes="(max-width: 768px) 100vw, 720px"
              priority
            />
          </button>

          {shots.length > 1 && (
            <>
              <button
                type="button"
                className="project-gallery-nav is-prev"
                onClick={() => go(active - 1)}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                type="button"
                className="project-gallery-nav is-next"
                onClick={() => go(active + 1)}
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
        </div>

        <p className="project-gallery-caption">{current.alt}</p>

        {shots.length > 1 && (
          <div className="project-gallery-thumbs" role="tablist" aria-label="Choose a shot">
            {shots.map((shot, index) => {
              const selected = index === active;
              return (
                <button
                  key={shot.src}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-label={shot.alt}
                  className={`project-gallery-thumb ${selected ? "is-active" : ""}`}
                  onClick={() => go(index)}
                >
                  <Image
                    src={shot.src}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="120px"
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {lightbox && (
        <div
          className="project-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={current.alt}
          onClick={() => setLightbox(false)}
        >
          <button
            type="button"
            className="project-lightbox-close"
            onClick={() => setLightbox(false)}
            aria-label="Close"
          >
            ✕
          </button>
          {shots.length > 1 && (
            <>
              <button
                type="button"
                className="project-lightbox-nav is-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  go(active - 1);
                }}
                aria-label="Previous image"
              >
                ←
              </button>
              <button
                type="button"
                className="project-lightbox-nav is-next"
                onClick={(e) => {
                  e.stopPropagation();
                  go(active + 1);
                }}
                aria-label="Next image"
              >
                →
              </button>
            </>
          )}
          <div
            className="project-lightbox-frame"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={current.src}
              alt={current.alt}
              width={1600}
              height={1000}
              className="project-lightbox-img"
              sizes="100vw"
            />
            <p>{current.alt}</p>
          </div>
        </div>
      )}
    </section>
  );
}
