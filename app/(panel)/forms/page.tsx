"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function UsersRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/forms/trip");
  }, [router]);

  return null;
}
