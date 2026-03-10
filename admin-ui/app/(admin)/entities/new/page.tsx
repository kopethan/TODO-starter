import { PageHeader } from "@/components/layout/page-header";
import { EntityForm } from "@/features/entities/components/entity-form";

export default function NewEntityPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Create entity"
        description="Add a canonical page that later holds facts, structured sections, and linked experience reports."
      />
      <EntityForm />
    </div>
  );
}
