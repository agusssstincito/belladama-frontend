"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), { 
  ssr: false,
  loading: () => <div className="absolute inset-0 bg-lumiere-cream" />
});

export function Background3D() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="fixed inset-0 -z-10 bg-lumiere-cream" />;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-lumiere-cream">
      <Scene3D />
    </div>
  );
}
