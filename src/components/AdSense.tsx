"use client";

import { useEffect, useId } from "react";

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

type AdSenseProps = {
  format?: "auto" | "horizontal" | "vertical" | "rectangle";
  className?: string;
  style?: React.CSSProperties;
};

const CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "";

export function AdSense({
  format = "auto",
  className = "",
  style,
}: AdSenseProps) {
  const uid = useId();
  const hasClient = Boolean(CLIENT) && !CLIENT.includes("XXXXXXXX");

  useEffect(() => {
    if (!hasClient) return;
    const t = window.setTimeout(() => {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // ignore
      }
    }, 100);
    return () => window.clearTimeout(t);
  }, [hasClient, uid]);

  if (!hasClient) {
    return (
      <div className={`ad-placeholder ${className}`} style={style} aria-hidden="true">
        <span>Advertisement</span>
        <small>Set NEXT_PUBLIC_ADSENSE_CLIENT_ID in environment</small>
      </div>
    );
  }

  return (
    <div className={`ad-slot ${className}`} style={style}>
      <ins
        className="adsbygoogle"
        style={{
          display: "block",
          width: "100%",
          minHeight: 90,
          ...(style || {}),
        }}
        data-ad-client={CLIENT}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
}
