"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import type { Sponsor } from "@/types";

type SponsorBannerProps = {
  sponsor: Sponsor;
};

export default function SponsorBanner({ sponsor }: SponsorBannerProps) {
  const bannerRef = useRef<HTMLElement>(null);
  const recordedId = useRef<string | null>(null);

  useEffect(() => {
    const element = bannerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((entry) => entry.isIntersecting);

        if (visible && recordedId.current !== sponsor.id) {
          recordedId.current = sponsor.id;

          // Classroom demo: browser console only, with no personal data.
          console.info("sponsor_impression", {
            sponsorId: sponsor.id,
            placement: "homepage",
            timestamp: new Date().toISOString(),
            pageContext: "listing-home",
          });

          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [sponsor.id]);

  return (
    <aside
      ref={bannerRef}
      className="flex items-center gap-4 rounded-xl bg-blue-950 p-6 text-white"
      aria-label={`Sponsored by ${sponsor.name}`}
    >
      <Image
        src={sponsor.imageUrl}
        alt={sponsor.imageAlt}
        width={80}
        height={80}
        className="rounded-lg"
      />

      <div>
        <p className="text-sm font-semibold uppercase text-blue-300">
          Sponsored
        </p>

        <h2 className="text-xl font-bold">{sponsor.name}</h2>

        {sponsor.tagline && <p className="mt-1">{sponsor.tagline}</p>}

        <a
          href={`/api/sponsors/click?id=${encodeURIComponent(sponsor.id)}`}
          className="mt-3 inline-block text-blue-300 underline"
        >
          Visit sponsor
        </a>
      </div>
    </aside>
  );
}