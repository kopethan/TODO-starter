"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@todo/ui";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const dark = mounted && resolvedTheme === "dark";

  return (
    <Button type="button" variant="ghost" onClick={() => setTheme(dark ? "light" : "dark")}>
      {dark ? "Light mode" : "Dark mode"}
    </Button>
  );
}
