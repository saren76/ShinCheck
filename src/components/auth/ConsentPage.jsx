import { ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth/AuthLayout";

export function ConsentPage() {
  return (
    <AuthLayout icon={ShieldCheck} title="Authorization" subtitle="External integrations are managed via Supabase.">
      <p className="text-center text-sm text-foreground">No pending authorization requests.</p>
    </AuthLayout>
  );
}
