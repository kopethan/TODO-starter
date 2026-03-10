"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { enumOptions, ENTITY_STATUSES, ENTITY_TYPES, VISIBILITIES } from "@/lib/enums";

export function EntityFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get("q") ?? "");
  const [type, setType] = useState(searchParams.get("type") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "");
  const [visibility, setVisibility] = useState(searchParams.get("visibility") ?? "");

  const submit = () => {
    const next = new URLSearchParams(searchParams.toString());

    if (q) next.set("q", q); else next.delete("q");
    if (type) next.set("type", type); else next.delete("type");
    if (status) next.set("status", status); else next.delete("status");
    if (visibility) next.set("visibility", visibility); else next.delete("visibility");

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const reset = () => {
    setQ("");
    setType("");
    setStatus("");
    setVisibility("");
    router.push(pathname);
  };

  return (
    <Card>
      <CardContent className="grid gap-3 md:grid-cols-4 xl:grid-cols-6">
        <Input
          value={q}
          onChange={(event) => setQ(event.target.value)}
          placeholder="Search title or summary"
          className="md:col-span-2 xl:col-span-2"
        />

        <Select value={type} onChange={(event) => setType(event.target.value)}>
          <option value="">All types</option>
          {enumOptions(ENTITY_TYPES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">All statuses</option>
          {enumOptions(ENTITY_STATUSES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select value={visibility} onChange={(event) => setVisibility(event.target.value)}>
          <option value="">All visibility</option>
          {enumOptions(VISIBILITIES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={submit}>Apply</Button>
          <Button variant="ghost" onClick={reset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
