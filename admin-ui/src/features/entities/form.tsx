"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { entityStatuses, entityTypes, visibilityOptions } from "@/lib/data/enums";
import { formatEnum } from "@/lib/utils/format";
import type { EntityFormInput } from "@/features/entities";

const schema = z.object({
  title: z.string().min(2),
  slug: z.string().min(0).optional(),
  entityType: z.enum(entityTypes),
  shortDescription: z.string().min(10),
  longDescription: z.string().optional(),
  status: z.enum(entityStatuses),
  visibility: z.enum(visibilityOptions)
});

export function EntityForm({ initialValues, onSubmit, submitLabel, loading }: { initialValues: EntityFormInput; onSubmit: (values: EntityFormInput) => Promise<void> | void; submitLabel: string; loading?: boolean }) {
  const form = useForm<EntityFormInput>({ resolver: zodResolver(schema), defaultValues: initialValues });
  const { register, handleSubmit, formState: { errors } } = form;

  return (
    <form className="space-y-5" onSubmit={handleSubmit(async (values) => onSubmit(values))}>
      <Card className="p-5">
        <h2 className="text-base font-semibold">Identity</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Title" error={errors.title?.message}><Input {...register("title")} /></Field>
          <Field label="Slug" error={errors.slug?.message}><Input {...register("slug")} placeholder="optional" /></Field>
          <Field label="Entity type" error={errors.entityType?.message}><Select {...register("entityType")}>{entityTypes.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
          <Field label="Status" error={errors.status?.message}><Select {...register("status")}>{entityStatuses.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
          <Field label="Visibility" error={errors.visibility?.message}><Select {...register("visibility")}>{visibilityOptions.map((v) => <option key={v} value={v}>{formatEnum(v)}</option>)}</Select></Field>
        </div>
      </Card>
      <Card className="p-5">
        <h2 className="text-base font-semibold">Summary</h2>
        <div className="mt-4 space-y-4">
          <Field label="Short description" error={errors.shortDescription?.message}><Textarea className="min-h-24" {...register("shortDescription")} /></Field>
          <Field label="Long description" error={errors.longDescription?.message}><Textarea className="min-h-40" {...register("longDescription")} /></Field>
        </div>
      </Card>
      <div className="flex justify-end"><Button type="submit" variant="primary" disabled={loading}>{loading ? "Saving..." : submitLabel}</Button></div>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <div><label className="mb-2 block text-sm font-medium">{label}</label>{children}{error ? <p className="mt-1 text-sm text-[var(--danger-text)]">{error}</p> : null}</div>;
}
