"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { updateReport } from "@/lib/api/reports";
import {
  enumOptions,
  MODERATION_STATES,
  REPORT_OUTCOMES,
  SEVERITY_LEVELS,
  VERIFICATION_STATES
} from "@/lib/enums";
import type { ReportDetail } from "@/types/report";
import {
  reportModerationSchema,
  type ReportModerationValues
} from "@/features/reports/schemas/report-moderation-schema";

export function ModerationForm({ report }: { report: ReportDetail }) {
  const router = useRouter();
  const [values, setValues] = useState<ReportModerationValues>({
    verificationState: report.verificationState,
    moderationState: report.moderationState,
    severityLevel: report.severityLevel,
    outcome: report.outcome ?? ""
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    const parsed = reportModerationSchema.safeParse(values);
    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    try {
      await updateReport(report.id, {
        verificationState: parsed.data.verificationState,
        moderationState: parsed.data.moderationState,
        severityLevel: parsed.data.severityLevel,
        outcome: parsed.data.outcome || undefined
      });
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to update report.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Moderation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="space-y-4">
          <Field>
            <FieldLabel>Verification state</FieldLabel>
            <Select value={values.verificationState} onChange={(event) => setValues((current) => ({ ...current, verificationState: event.target.value as ReportModerationValues["verificationState"] }))}>
              {enumOptions(VERIFICATION_STATES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{errors.verificationState}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Moderation state</FieldLabel>
            <Select value={values.moderationState} onChange={(event) => setValues((current) => ({ ...current, moderationState: event.target.value as ReportModerationValues["moderationState"] }))}>
              {enumOptions(MODERATION_STATES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{errors.moderationState}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Severity</FieldLabel>
            <Select value={values.severityLevel} onChange={(event) => setValues((current) => ({ ...current, severityLevel: event.target.value as ReportModerationValues["severityLevel"] }))}>
              {enumOptions(SEVERITY_LEVELS).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{errors.severityLevel}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Outcome</FieldLabel>
            <Select value={values.outcome} onChange={(event) => setValues((current) => ({ ...current, outcome: event.target.value as ReportModerationValues["outcome"] }))}>
              <option value="">No change</option>
              {enumOptions(REPORT_OUTCOMES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{errors.outcome}</FieldError>
          </Field>

          {formError ? <p className="text-sm text-[var(--danger)]">{formError}</p> : null}

          <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save moderation"}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
