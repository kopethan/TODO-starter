"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Input, Select, Textarea, formatEnum } from "@todo/ui";
import { sectionTypes, type SectionFormInput } from "@todo/types";
import { FormField } from "@/components/shared/form-field";
import { InlineNotice } from "@/components/shared/inline-notice";

const schema = z.object({
  sectionType: z.enum(sectionTypes),
  title: z.string().min(2),
  content: z.string().min(10),
  sortOrder: z.coerce.number().int().min(0)
});

export function EntitySectionForm({
  initialValues,
  submitLabel,
  loading,
  onSubmit,
  onCancel
}: {
  initialValues: SectionFormInput;
  submitLabel: string;
  loading?: boolean;
  onSubmit: (values: SectionFormInput) => Promise<void> | void;
  onCancel?: () => void;
}) {
  const form = useForm<SectionFormInput>({
    resolver: zodResolver(schema),
    defaultValues: initialValues
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty }
  } = form;

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  return (
    <form
      className="space-y-4"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset(values);
      })}
    >
      {isDirty ? (
        <InlineNotice tone="warning" title="Unsaved section edits" description="Save this section before closing if you want to keep the latest changes." />
      ) : null}

      <FormField label="Section type" error={errors.sectionType?.message}>
        <Select {...register("sectionType")}>
          {sectionTypes.map((value) => (
            <option key={value} value={value}>
              {formatEnum(value)}
            </option>
          ))}
        </Select>
      </FormField>
      <FormField label="Title" error={errors.title?.message}>
        <Input {...register("title")} />
      </FormField>
      <FormField label="Sort order" hint="Lower numbers appear first." error={errors.sortOrder?.message}>
        <Input type="number" min={0} {...register("sortOrder", { valueAsNumber: true })} />
      </FormField>
      <FormField label="Content" error={errors.content?.message}>
        <Textarea className="min-h-48" {...register("content")} />
      </FormField>
      <div className="flex justify-end gap-3">
        {isDirty ? (
          <Button type="button" variant="ghost" onClick={() => reset(initialValues)}>
            Reset
          </Button>
        ) : null}
        {onCancel ? (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading || !isDirty}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
