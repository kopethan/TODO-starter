"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonClasses } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldHint, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createEntity, updateEntity } from "@/lib/api/entities";
import { enumOptions, ENTITY_STATUSES, ENTITY_TYPES, VISIBILITIES } from "@/lib/enums";
import type { EntityDetail } from "@/types/entity";
import {
  entityFormSchema,
  type EntityFormValues
} from "@/features/entities/schemas/entity-form-schema";

function normalize(values: EntityFormValues) {
  return {
    ...values,
    slug: values.slug?.trim() ? values.slug.trim() : undefined,
    longDescription: values.longDescription?.trim() ? values.longDescription.trim() : undefined
  };
}

export function EntityForm({ entity }: { entity?: EntityDetail }) {
  const router = useRouter();
  const [values, setValues] = useState<EntityFormValues>({
    title: entity?.title ?? "",
    slug: entity?.slug ?? "",
    entityType: entity?.entityType ?? "OBJECT",
    shortDescription: entity?.shortDescription ?? "",
    longDescription: entity?.longDescription ?? "",
    status: entity?.status ?? "DRAFT",
    visibility: entity?.visibility ?? "PUBLIC"
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const update = (name: keyof EntityFormValues, value: string) => {
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: "" }));
    setFormError("");
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    setFieldErrors({});

    const parsed = entityFormSchema.safeParse(values);

    if (!parsed.success) {
      const nextErrors: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0] ?? "form");
        if (!nextErrors[key]) nextErrors[key] = issue.message;
      }
      setFieldErrors(nextErrors);
      setSubmitting(false);
      return;
    }

    try {
      const payload = normalize(parsed.data);
      const saved = entity
        ? await updateEntity(entity.id, payload)
        : await createEntity(payload);

      router.push(`/entities/${saved.id}`);
      router.refresh();
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Unable to save entity.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{entity ? "Entity overview" : "New entity"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-5 md:grid-cols-2">
          <Field className="md:col-span-2">
            <FieldLabel>Title</FieldLabel>
            <Input value={values.title} onChange={(event) => update("title", event.target.value)} placeholder="Used iPhone" />
            <FieldError>{fieldErrors.title}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Slug</FieldLabel>
            <Input value={values.slug} onChange={(event) => update("slug", event.target.value)} placeholder="used-iphone" />
            <FieldHint>Leave empty to auto-generate from the title.</FieldHint>
            <FieldError>{fieldErrors.slug}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Entity type</FieldLabel>
            <Select value={values.entityType} onChange={(event) => update("entityType", event.target.value)}>
              {enumOptions(ENTITY_TYPES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{fieldErrors.entityType}</FieldError>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Short description</FieldLabel>
            <Textarea value={values.shortDescription} onChange={(event) => update("shortDescription", event.target.value)} placeholder="A short operational summary for admins and later public display." />
            <FieldError>{fieldErrors.shortDescription}</FieldError>
          </Field>

          <Field className="md:col-span-2">
            <FieldLabel>Long description</FieldLabel>
            <Textarea value={values.longDescription} onChange={(event) => update("longDescription", event.target.value)} placeholder="Optional extended explanation about the entity and how it normally works." />
            <FieldError>{fieldErrors.longDescription}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Status</FieldLabel>
            <Select value={values.status} onChange={(event) => update("status", event.target.value)}>
              {enumOptions(ENTITY_STATUSES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{fieldErrors.status}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Visibility</FieldLabel>
            <Select value={values.visibility} onChange={(event) => update("visibility", event.target.value)}>
              {enumOptions(VISIBILITIES).map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
            <FieldError>{fieldErrors.visibility}</FieldError>
          </Field>
        </CardContent>
      </Card>

      {formError ? (
        <Card className="border-[var(--danger-border)] bg-[var(--danger-soft)]">
          <CardContent className="py-4 text-sm text-[var(--danger)]">{formError}</CardContent>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : entity ? "Save changes" : "Create entity"}</Button>
        <Link href={entity ? `/entities/${entity.id}` : "/entities"} className={buttonClasses({ variant: "ghost" })}>
          Cancel
        </Link>
      </div>
    </form>
  );
}
