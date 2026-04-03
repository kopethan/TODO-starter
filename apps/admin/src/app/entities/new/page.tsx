"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button, PageHeader } from "@todo/ui";
import { KeyValueList } from "@/components/shared/key-value-list";
import { PageSection } from "@/components/shared/page-section";
import { useToast } from "@/components/shared/toast-provider";
import { EntityForm } from "@/features/entities/form";
import { useCreateEntity } from "@/features/entities";

export default function NewEntityPage() {
  const router = useRouter();
  const createEntity = useCreateEntity();
  const { pushToast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="New entity"
        subtitle="Create the canonical record before sections, reports, and future source links are attached."
        actions={
          <Link href="/entities">
            <Button variant="secondary">Back to entities</Button>
          </Link>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <EntityForm
          initialValues={{
            title: "",
            slug: "",
            entityType: "SERVICE",
            shortDescription: "",
            longDescription: "",
            status: "DRAFT",
            visibility: "PUBLIC"
          }}
          submitLabel="Create entity"
          loading={createEntity.isPending}
          onSubmit={async (values) => {
            try {
              const created = await createEntity.mutateAsync(values);
              pushToast({
                tone: "success",
                title: "Entity created",
                description: `${created.title} is ready for section editing and moderation context.`
              });
              router.push(`/entities/${created.id}`);
            } catch (error) {
              pushToast({
                tone: "danger",
                title: "Could not create entity",
                description: error instanceof Error ? error.message : "The request failed before the canonical record could be created."
              });
              throw error;
            }
          }}
        />

        <div className="space-y-6">
          <PageSection title="Publishing notes" description="Quiet defaults are safer for V1.">
            <KeyValueList
              items={[
                { label: "Draft first", value: "Start as Draft unless the record is already reviewed and complete." },
                { label: "Short description", value: "Use one factual paragraph. Avoid promotional or emotional language." },
                { label: "Visibility", value: "Keep Private or Hidden for unfinished or internal-only records." }
              ]}
            />
          </PageSection>
        </div>
      </div>
    </div>
  );
}
