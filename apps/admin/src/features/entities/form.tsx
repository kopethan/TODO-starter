"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button, Card, Input, Select, Textarea, formatEnum } from "@todo/ui";
import { entityStatuses, entityTypes, visibilityOptions, type EntityFormInput } from "@todo/types";
import { FormField } from "@/components/shared/form-field";
import { InlineNotice } from "@/components/shared/inline-notice";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(0).optional(),
  entityType: z.enum(entityTypes),
  shortDescription: z.string().min(10),
  longDescription: z.string().optional(),
  status: z.enum(entityStatuses),
  visibility: z.enum(visibilityOptions)
});

export function EntityForm({
  initialValues,
  onSubmit,
  submitLabel,
  loading
}: {
  initialValues: EntityFormInput;
  onSubmit: (values: EntityFormInput) => Promise<void> | void;
  submitLabel: string;
  loading?: boolean;
}) {
  const form = useForm<EntityFormInput>({
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
      className="space-y-5"
      onSubmit={handleSubmit(async (values) => {
        await onSubmit(values);
        reset(values);
      })}
    >
      {isDirty ? (
        <InlineNotice
          tone="warning"
          title="Unsaved changes"
          description="You have local edits that have not been saved to the canonical entity record yet."
        />
      ) : null}

      <Card className="border border-[var(--border-default)] p-5">
        <h2 className="text-base font-semibold">Identity</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <FormField label="Title" error={errors.title?.message}>
            <Input {...register("title")} />
          </FormField>
          <FormField label="Slug" hint="Leave blank to generate from the title." error={errors.slug?.message}>
            <Input {...register("slug")} placeholder="optional" />
          </FormField>
          <FormField label="Entity type" error={errors.entityType?.message}>
            <Select {...register("entityType")}>
              {entityTypes.map((value) => (
                <option key={value} value={value}>
                  {formatEnum(value)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <Select {...register("status")}>
              {entityStatuses.map((value) => (
                <option key={value} value={value}>
                  {formatEnum(value)}
                </option>
              ))}
            </Select>
          </FormField>
          <FormField label="Visibility" error={errors.visibility?.message}>
            <Select {...register("visibility")}>
              {visibilityOptions.map((value) => (
                <option key={value} value={value}>
                  {formatEnum(value)}
                </option>
              ))}
            </Select>
          </FormField>
        </div>
      </Card>

      <Card className="border border-[var(--border-default)] p-5">
        <h2 className="text-base font-semibold">Description</h2>
        <div className="mt-4 space-y-4">
          <FormField
            label="Short description"
            hint="Keep this short and factual. It is used heavily in lists and previews."
            error={errors.shortDescription?.message}
          >
            <Textarea className="min-h-24" {...register("shortDescription")} />
          </FormField>
          <FormField
            label="Long description"
            hint="Use this for the canonical explanation of what the entity is and how it works."
            error={errors.longDescription?.message}
          >
            <Textarea className="min-h-40" {...register("longDescription")} />
          </FormField>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        {isDirty ? (
          <Button type="button" variant="ghost" onClick={() => reset(initialValues)}>
            Discard changes
          </Button>
        ) : null}
        <Button type="submit" variant="primary" disabled={loading || !isDirty}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}
