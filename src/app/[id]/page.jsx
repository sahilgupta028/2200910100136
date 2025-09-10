"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RedirectPage() {
  const router = useRouter();
  const  slug = window.location.pathname.slice(1);

  useEffect(() => {
    if (!slug) return;

    const saved = localStorage.getItem("shortLinks");
    if (!saved) {
      router.replace("/?error=notfound");
      return;
    }

    const links = JSON.parse(saved);
    console.log(links)
    const match = links.find((l) => l.slug === slug);

    if (match) {
      // update analytics
      const updated = links.map((l) =>
        l.slug === slug
          ? { ...l, clicks: l.clicks + 1, lastClicked: new Date().toISOString() }
          : l
      );
      localStorage.setItem("shortLinks", JSON.stringify(updated));

      // redirect
      window.location.href = match.url;
    } else {
      router.replace("/?error=notfound");
    }
  }, [slug, router]);

  return <p style={{ textAlign: "center", marginTop: "2rem" }}>Redirecting...</p>;
}