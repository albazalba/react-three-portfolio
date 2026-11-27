"use client";

import dynamic from "next/dynamic";

const MuseumExperience = dynamic(() => import("./MuseumExperience"), {
  ssr: false,
  loading: () => <div className="fixed inset-0 bg-[#0c0b09]" aria-hidden="true" />,
});

export default function MuseumRoot() {
  return <MuseumExperience />;
}
