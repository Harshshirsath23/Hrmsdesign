import { useEffect, useRef, useState } from "react";

export function AppChromeEffects() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    let trailX = 0;
    let trailY = 0;
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let frame = 0;

    const move = (event: MouseEvent) => {
      mouseX = event.clientX;
      mouseY = event.clientY;

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`;
      }
    };

    const animate = () => {
      trailX += (mouseX - trailX) * 0.18;
      trailY += (mouseY - trailY) * 0.18;

      if (trailRef.current) {
        trailRef.current.style.transform = `translate3d(${trailX}px, ${trailY}px, 0) translate(-50%, -50%)`;
      }

      frame = window.requestAnimationFrame(animate);
    };

    const handleOver = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      setHovering(
        Boolean(
          target?.closest(
            "button, a, input, textarea, select, [role='button'], [data-slot='card'], .surface-card, .flat-card"
          )
        )
      );
    };

    const handleDown = (event: MouseEvent) => {
      const ripple = document.createElement("span");
      ripple.className = "hrms-cursor-ripple";
      ripple.style.left = `${event.clientX}px`;
      ripple.style.top = `${event.clientY}px`;
      document.body.appendChild(ripple);

      window.setTimeout(() => {
        ripple.remove();
      }, 600);
    };

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseover", handleOver);
    window.addEventListener("mousedown", handleDown);
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", handleOver);
      window.removeEventListener("mousedown", handleDown);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <div className="hrms-loader" aria-hidden="true">
        <div className="hrms-loader-ring" />
      </div>
      <div ref={cursorRef} className="hrms-cursor" aria-hidden="true" />
      <div
        ref={trailRef}
        className={`hrms-cursor-trail ${hovering ? "is-hovering" : ""}`}
        aria-hidden="true"
      />
    </>
  );
}
