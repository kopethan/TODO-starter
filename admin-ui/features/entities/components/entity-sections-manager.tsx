"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createSection, deleteSection, updateSection } from "@/lib/api/entities";
import { enumOptions, SECTION_TYPES } from "@/lib/enums";
import type { EntitySection } from "@/types/entity";
import { SectionTypeBadge } from "@/features/entities/components/entity-badges";
import {
  sectionFormSchema,
  type SectionFormValues
} from "@/features/entities/schemas/section-form-schema";

const emptyValues: SectionFormValues = {
  sectionType: "DEFINITION",
  title: "",
  content: "",
  sortOrder: 0
};

export function EntitySectionsManager({
  entityId,
  sections
}: {
  entityId: string;
  sections: EntitySection[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<"create" | "edit">("create");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [values, setValues] = useState<SectionFormValues>(emptyValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const reset = () => {
    setMode("create");
    setEditingId(null);
    setValues(emptyValues);
    setErrors({});
    setFormError("");
  };

  const startEdit = (section: EntitySection) => {
    setMode("edit");
    setEditingId(section.id);
    setValues({
      sectionType: section.sectionType,
      title: section.title,
      content: section.content,
      sortOrder: section.sortOrder
    });
    setErrors({});
    setFormError("");
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setErrors({});
    setFormError("");

    const parsed = sectionFormSchema.safeParse(values);
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
      if (mode === "edit" && editingId) {
        await updateSection(entityId, editingId, parsed.data);
      } else {
        await createSection(entityId, parsed.data);
      }
      reset();
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save section.");
    } finally {
      setSubmitting(false);
    }
  };

  const remove = async (sectionId: string) => {
    const confirmed = window.confirm("Delete this section?");
    if (!confirmed) return;

    try {
      await deleteSection(entityId, sectionId);
      if (editingId === sectionId) reset();
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to delete section.");
    }
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Existing sections</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {sections.length === 0 ? (
            <p className="text-sm text-[var(--text-muted)]">No sections yet. Add the first structured knowledge block.</p>
          ) : (
            sections.map((section) => (
              <div key={section.id} className="rounded-2xl border border-[var(--border)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <SectionTypeBadge value={section.sectionType} />
                      <span className="text-xs text-[var(--text-soft)]">Sort {section.sortOrder}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-[var(--text-strong)]">{section.title}</h3>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" onClick={() => startEdit(section)}>Edit</Button>
                    <Button type="button" variant="danger" size="sm" onClick={() => remove(section.id)}>Delete</Button>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-[var(--text-muted)]">{section.content}</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{mode === "edit" ? "Edit section" : "Add section"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Field>
              <FieldLabel>Section type</FieldLabel>
              <Select value={values.sectionType} onChange={(event) => setValues((current) => ({ ...current, sectionType: event.target.value as SectionFormValues["sectionType"] }))}>
                {enumOptions(SECTION_TYPES).map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <FieldError>{errors.sectionType}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Title</FieldLabel>
              <Input value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} placeholder="Red flags" />
              <FieldError>{errors.title}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Content</FieldLabel>
              <Textarea value={values.content} onChange={(event) => setValues((current) => ({ ...current, content: event.target.value }))} placeholder="Seller refuses to show IMEI, asks for deposits, or forces off-platform payment." />
              <FieldError>{errors.content}</FieldError>
            </Field>

            <Field>
              <FieldLabel>Sort order</FieldLabel>
              <Input type="number" min={0} value={values.sortOrder} onChange={(event) => setValues((current) => ({ ...current, sortOrder: Number(event.target.value) }))} />
              <FieldError>{errors.sortOrder}</FieldError>
            </Field>

            {formError ? <p className="text-sm text-[var(--danger)]">{formError}</p> : null}

            <div className="flex gap-2">
              <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : mode === "edit" ? "Save section" : "Add section"}</Button>
              {mode === "edit" ? (
                <Button type="button" variant="ghost" onClick={reset}>Cancel edit</Button>
              ) : null}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
