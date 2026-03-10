"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { enumOptions, MODERATION_STATES, REPORT_TYPES, VERIFICATION_STATES } from "@/lib/enums";

export function ReportFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [entityId, setEntityId] = useState(searchParams.get("entityId") ?? "");
  const [reportType, setReportType] = useState(searchParams.get("reportType") ?? "");
  const [moderationState, setModerationState] = useState(searchParams.get("moderationState") ?? "");
  const [verificationState, setVerificationState] = useState(searchParams.get("verificationState") ?? "");

  const apply = () => {
    const next = new URLSearchParams(searchParams.toString());

    if (entityId) next.set("entityId", entityId); else next.delete("entityId");
    if (reportType) next.set("reportType", reportType); else next.delete("reportType");
    if (moderationState) next.set("moderationState", moderationState); else next.delete("moderationState");
    if (verificationState) next.set("verificationState", verificationState); else next.delete("verificationState");

    const query = next.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const reset = () => {
    setEntityId("");
    setReportType("");
    setModerationState("");
    setVerificationState("");
    router.push(pathname);
  };

  return (
    <Card>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <Input
          value={entityId}
          onChange={(event) => setEntityId(event.target.value)}
          placeholder="Filter by entity ID"
        />

        <Select value={reportType} onChange={(event) => setReportType(event.target.value)}>
          <option value="">All report types</option>
          {enumOptions(REPORT_TYPES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select value={moderationState} onChange={(event) => setModerationState(event.target.value)}>
          <option value="">All moderation states</option>
          {enumOptions(MODERATION_STATES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <Select value={verificationState} onChange={(event) => setVerificationState(event.target.value)}>
          <option value="">All verification states</option>
          {enumOptions(VERIFICATION_STATES).map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </Select>

        <div className="flex gap-2">
          <Button variant="secondary" onClick={apply}>Apply</Button>
          <Button variant="ghost" onClick={reset}>Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}
