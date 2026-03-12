"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Card, Select, formatEnum } from "@todo/ui";
import { moderationStates, reportOutcomes, severityLevels, verificationStates, type ReportDetail, type ReportModerationInput } from "@todo/types";

const schema = z.object({
  verificationState: z.enum(verificationStates),
  moderationState: z.enum(moderationStates),
  severityLevel: z.enum(severityLevels),
  outcome: z.enum(reportOutcomes)
});

export function ReportModerationForm({ report, onSubmit, loading }: { report: ReportDetail; onSubmit: (values: ReportModerationInput) => Promise<void> | void; loading?: boolean }) {
  const form = useForm<ReportModerationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      verificationState: report.verificationState,
      moderationState: report.moderationState,
      severityLevel: report.severityLevel,
      outcome: report.outcome ?? "UNKNOWN"
    }
  });
  const { register, handleSubmit } = form;

  return (
    <Card className="p-5">
      <h2 className="text-base font-semibold">Moderation</h2>
      <form className="mt-4 space-y-4" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
        <Field label="Verification state"><Select {...register("verificationState")}>{verificationStates.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
        <Field label="Moderation state"><Select {...register("moderationState")}>{moderationStates.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
        <Field label="Severity"><Select {...register("severityLevel")}>{severityLevels.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
        <Field label="Outcome"><Select {...register("outcome")}>{reportOutcomes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
        <div className="flex justify-end"><Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : "Save moderation"}</Button></div>
      </form>
    </Card>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-medium">{label}</label>{children}</div>;
}
