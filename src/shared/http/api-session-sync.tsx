"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { setUnauthorizedHandler } from "@/shared/http/unauthorized";

export function ApiSessionSync() {
  const router = useRouter();

  useEffect(() => {
    setUnauthorizedHandler(() => {
      router.replace("/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  return null;
}
