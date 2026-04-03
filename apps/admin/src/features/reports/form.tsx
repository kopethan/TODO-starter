"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Card, Select, formatEnum } from "@todo/ui";
import { moderationStates, reportOutcomes, severityLevels, verificationStates, type ReportDetail, type ReportModerationInput } from "@todo/types";
import { FormField } from "@/components/shared/form-field";
import { InlineNotice } from "@/components/shared/inline-notice";

const schema = z.object({
  verificationState: z.enum(verificationStates),
  moderationState: z.enum(moderationStates),
  severityLevel: z.enum(severityLevels),
  outcome: z.enum(reportOutcomes)
});

export function ReportModerationForm({
  report,
  onSubmit,
  loading
}: {
  report: ReportDetail;
  onSubmit: (values: ReportModerationInput) => Promise<void> | void;
  loading?: boolean;
}) {
  const form = useForm<ReportModerationInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      verificationState: report.verificationState,
      moderationState: report.moderationState,
      severityLevel: report.severityLevel,
      outcome: report.outcome ?? "UNKNOWN"
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { isDirty }
  } = form;

  useEffect(() => {
    reset({
      verificationState: report.verificationState,
      moderationState: report.moderationState,
      severityLevel: report.severityLevel,
      outcome: report.outcome ?? "UNKNOWN"
    });
  }, [report, reset]);

  return (
    <Card className="border border-[var(--border-default)] p-5">
      <h2 className="text-base font-semibold">Moderation</h2>
      <form
        className="mt-4 space-y-4"
        onSubmit={handleSubmit(async (values) => {
          await onSubmit(values);
          reset(values);
        })}
      >
        {isDirty ? (
          <InlineNotice tone="warning" title="Unsaved moderation decision" description="Review changes before saving so verification and moderation states stay traceable." />
        ) : null}

        <FormField label="Verification state">
          <Select {...register("verificationState")}>
            {verificationStates.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Moderation state">
          <Select {...register("moderationState")}>
            {moderationStates.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Severity">
          <Select {...register("severityLevel")}>
            {severityLevels.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="Outcome">
          <Select {...register("outcome")}>
            {reportOutcomes.map((value) => (
              <option key={value} value={value}>
                {formatEnum(value)}
              </option>
            ))}
          </Select>
        </FormField>
        <div className="flex justify-end gap-3">
          {isDirty ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                reset({
                  verificationState: report.verificationState,
                  moderationState: report.moderationState,
                  severityLevel: report.severityLevel,
                  outcome: report.outcome ?? "UNKNOWN"
                })
              }
            >
              Reset
            </Button>
          ) : null}
          <Button type="submit" variant="primary" disabled={loading || !isDirty}>
            {loading ? "Saving..." : "Save moderation"}
          </Button>
        </div>
      </form>
    </Card>
  );
}
