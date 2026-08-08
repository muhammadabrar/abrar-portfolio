"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { testimonials } from "@/content/testimonials";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const AUTO_MS = 6500;

export function Testimonials({
  className = "shell section",
}: {
  className?: string;
}) {
  const root = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const peopleRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const drag = useRef({ startX: 0, delta: 0, dragging: false });
  const activeRef = useRef(0);
  const reduceMotion = useRef(false);

  activeRef.current = active;

  const goTo = (index: number) => {
    const next = (index + testimonials.length) % testimonials.length;
    setActive(next);
  };

  useEffect(() => {
    const scroller = peopleRef.current;
    if (!scroller) return;
    const selected = scroller.querySelector<HTMLElement>(
      `[data-testimonial-index="${active}"]`,
    );
    if (!selected) return;

    const scrollerLeft = scroller.getBoundingClientRect().left;
    const selectedLeft = selected.getBoundingClientRect().left;
    const offset =
      selectedLeft -
      scrollerLeft +
      scroller.scrollLeft -
      (scroller.clientWidth - selected.offsetWidth) / 2;

    scroller.scrollTo({
      left: Math.max(0, offset),
      behavior: reduceMotion.current ? "auto" : "smooth",
    });
  }, [active]);

  const goNext = () => goTo(activeRef.current + 1);
  const goPrev = () => goTo(activeRef.current - 1);

  useGSAP(
    () => {
      reduceMotion.current = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reduceMotion.current || !root.current) return;

      gsap.from(root.current.querySelectorAll("[data-testimonial-reveal]"), {
        y: 28,
        opacity: 0,
        duration: 0.75,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: root.current,
          start: "top 85%",
        },
      });
    },
    { scope: root },
  );

  useEffect(() => {
    if (reduceMotion.current) return;
    const quote = quoteRef.current;
    const meta = metaRef.current;
    if (!quote || !meta) return;

    const tl = gsap.timeline();
    tl.fromTo(
      quote,
      { y: 18, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, ease: "power2.out" },
    ).fromTo(
      meta,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.35, ease: "power2.out" },
      "-=0.25",
    );

    return () => {
      tl.kill();
    };
  }, [active]);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      if (document.hidden) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [paused, active]);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      drag.current = { startX: e.clientX, delta: 0, dragging: true };
      el.setPointerCapture(e.pointerId);
      setPaused(true);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!drag.current.dragging) return;
      drag.current.delta = e.clientX - drag.current.startX;
      if (quoteRef.current) {
        quoteRef.current.style.transform = `translateX(${drag.current.delta * 0.2}px)`;
        quoteRef.current.style.opacity = String(
          Math.max(0.45, 1 - Math.abs(drag.current.delta) / 280),
        );
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!drag.current.dragging) return;
      drag.current.dragging = false;
      const { delta } = drag.current;
      if (quoteRef.current) {
        quoteRef.current.style.transform = "";
        quoteRef.current.style.opacity = "";
      }
      if (Math.abs(delta) > 56) {
        if (delta < 0) goNext();
        else goPrev();
      }
      window.setTimeout(() => setPaused(false), 400);
      try {
        el.releasePointerCapture(e.pointerId);
      } catch {
        /* ignore */
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerUp);
    };
  }, []);

  const item = testimonials[active];
  const quoteLength =
    item.quote.length > 420 ? "long" : item.quote.length > 220 ? "mid" : "short";

  return (
    <section
      ref={root}
      className={className}
      aria-roledescription="carousel"
      aria-label="Testimonials"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          setPaused(false);
        }
      }}
    >
      <div
        className="mb-6 flex flex-wrap items-end justify-between gap-4"
        data-testimonial-reveal
      >
        <div>
          <h2 className="section-label mb-0">Kind words</h2>
          <p className="mt-2 max-w-md text-[color:var(--muted)]">
             hear how teams describe working with me.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="testimonial-nav-btn"
            onClick={goPrev}
            aria-label="Previous testimonial"
          >
            ←
          </button>
          <button
            type="button"
            className="testimonial-nav-btn"
            onClick={goNext}
            aria-label="Next testimonial"
          >
            →
          </button>
        </div>
      </div>

      <div
        ref={trackRef}
        className="testimonial-stage"
        data-testimonial-reveal
        role="group"
        aria-live="polite"
        aria-atomic="true"
      >
        
        <div className="testimonial-body" data-quote-length={quoteLength}>
          <p className="testimonial-mark" aria-hidden>
            “
          </p>
          <blockquote
            ref={quoteRef}
            className="testimonial-quote"
            data-quote-length={quoteLength}
          >
            {item.quote}
          </blockquote>
          <div ref={metaRef} className="testimonial-meta">
            <div
              className="testimonial-avatar"
              style={{ background: item.accent }}
              aria-hidden
            >
              {item.initials}
            </div>
            <div>
              <p className="font-semibold tracking-tight text-[color:var(--ink)]">
                {item.linkedIn ? (
                  <a
                    href={item.linkedIn}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {item.name}
                  </a>
                ) : (
                  item.name
                )}
              </p>
              <p className="text-sm text-[color:var(--muted)]">
                {item.role}
                {item.company !== "Personal" ? ` · ${item.company}` : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="testimonial-progress" aria-hidden>
          <span
            key={item.id}
            className={`testimonial-progress-bar ${paused ? "is-paused" : ""}`}
          />
        </div>
      </div>

      <div
        ref={peopleRef}
        className="testimonial-people"
        data-testimonial-reveal
        role="tablist"
        aria-label="Choose a testimonial"
      >
        <div className="testimonial-people-track">
          {testimonials.map((person, index) => {
            const selected = index === active;
            return (
              <button
                key={person.id}
                type="button"
                role="tab"
                data-testimonial-index={index}
                aria-selected={selected}
                aria-label={`${person.name}, ${person.role}`}
                className={`testimonial-person ${selected ? "is-active" : ""}`}
                onClick={() => goTo(index)}
              >
                <span
                  className="testimonial-person-avatar"
                  style={{ background: person.accent }}
                  aria-hidden
                >
                  {person.initials}
                </span>
                <span className="testimonial-person-copy">
                  <span className="testimonial-person-name">{person.name}</span>
                  <span className="testimonial-person-role">
                    {person.company === "Personal"
                      ? person.role
                      : person.company}
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
