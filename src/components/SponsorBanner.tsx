import Image from "next/image";
import type { Sponsor } from "@/types";

type SponsorBannerProps = {
  sponsor: Sponsor;
};

export default function SponsorBanner({
  sponsor,
}: SponsorBannerProps) {
  return (
    <aside
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
          href={sponsor.href}
          className="mt-3 inline-block text-blue-300 underline"
        >
          Visit sponsor
        </a>
      </div>
    </aside>
  );
}