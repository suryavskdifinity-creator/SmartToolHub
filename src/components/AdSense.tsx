"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

type AdSenseProps = {
  slot?: string;
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  style?: React.CSSProperties;
  className?: string;
  fullWidthResponsive?: boolean;
};

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

export function AdSense({
  slot,
  format = "auto",
  style,
  className = "",
  fullWidthResponsive = true,
}: AdSenseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pushedRef = useRef(false);
  const isPlaceholder =
    !CLIENT ||
    CLIENT.includes("XXXXXXXX") ||
    !slot ||
    slot.includes("XXXXXXXX");

  useEffect(() => {
    if (isPlaceholder) return;
    const container = containerRef.current;
    const ad = container?.querySelector<HTMLElement>(".adsbygoogle");
    if (!container || !ad) return;

    let disposed = false;
    let observer: ResizeObserver | undefined;

    const tryInitialize = () => {
      if (disposed || pushedRef.current || !container.isConnected || !ad.isConnected) return;
      const width = Math.floor(container.getBoundingClientRect().width);
      // AdSense throws "No slot size" when initialized inside a zero-width/hidden layout.
      if (width < 1 || container.getClientRects().length === 0) return;

      // Do not push a slot that Google has already initialized.
      if (ad.getAttribute("data-adsbygoogle-status") || ad.getAttribute("data-ad-status")) {
        pushedRef.current = true;
        return;
      }

      try {
        window.adsbygoogle = window.adsbygoogle || [];
        window.adsbygoogle.push({});
        pushedRef.current = true;
      } catch (error) {
        // Keep the slot eligible for a later retry if the script/layout is not ready.
        console.warn("AdSense slot initialization deferred:", error);
      }
    };

    // Run after layout, then wait for hidden tabs/menus to become measurable.
    const frame = window.requestAnimationFrame(tryInitialize);
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(tryInitialize);
      observer.observe(container);
    }
    window.addEventListener("resize", tryInitialize);
    window.addEventListener("load", tryInitialize, { once: true });

    return () => {
      disposed = true;
      window.cancelAnimationFrame(frame);
      observer?.disconnect();
      window.removeEventListener("resize", tryInitialize);
    };
  }, [isPlaceholder, slot]);

  if (isPlaceholder) {
    return (
      <div className={`ad-placeholder ${className}`} style={style} aria-hidden="true">
        <span>Advertisement</span>
        <small>AdSense will appear here after your publisher ID and ad slot are configured.</small>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`ad-slot ${className}`}
      style={{ width: "100%", minWidth: 0, minHeight: 100, ...style }}
    >
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", minWidth: 0, minHeight: 100 }}
        data-ad-client={CLIENT}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      />
    </div>
  );
}
