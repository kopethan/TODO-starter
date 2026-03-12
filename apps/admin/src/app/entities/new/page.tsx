"use client";

import { useRouter } from "next/navigation";
import { Card, PageHeader } from "@todo/ui";
import { EntityForm } from "@/features/entities/form";
import { useCreateEntity, type EntityFormInput } from "@/features/entities";

const defaults: EntityFormInput = {
  title: "",
  slug: "",
  entityType: "OBJECT",
  shortDescription: "",
  longDescription: "",
  status: "DRAFT",
  visibility: "PUBLIC"
};

export default function NewEntityPage() {
  const router = useRouter();
  const mutation = useCreateEntity();

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div>
        <PageHeader title="New entity" subtitle="Create a canonical page for an object, service, or situation." />
        <EntityForm
          initialValues={defaults}
          submitLabel="Create entity"
          loading={mutation.isPending}
          onSubmit={async (values) => {
            const created = await mutation.mutateAsync(values);
            router.push(`/entities/${created.id}`);
          }}
        />
      </div>
      <Card className="h-fit p-5">
        <h2 className="text-base font-semibold">Publishing notes</h2>
        <ul className="mt-3 space-y-2 text-sm text-[var(--text-secondary)]">
          <li>Start as draft until the page structure is stable.</li>
          <li>Keep the slug steady once the entity becomes public.</li>
          <li>Use sections to separate facts, risks, and guidance.</li>
        </ul>
      </Card>
    </div>
  );
}
