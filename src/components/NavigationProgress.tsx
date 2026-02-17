"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";
import "nprogress/nprogress.css";

// Cấu hình NProgress
NProgress.configure({
  showSpinner: false, // Ẩn spinner
  trickleSpeed: 200,
  minimum: 0.3,
  easing: "ease",
  speed: 500,
});

export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Bắt đầu progress bar
    NProgress.start();

    // Kết thúc progress bar sau khi component mount
    const timeoutId = setTimeout(() => {
      NProgress.done();
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
