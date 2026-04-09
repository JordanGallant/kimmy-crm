import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PartnerDetail } from "./partner-detail";

export default async function PartnerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: partner } = await supabase
    .from("partners")
    .select("*, contacts(*), activities(*)")
    .eq("id", id)
    .single();

  if (!partner) {
    notFound();
  }

  return <PartnerDetail partner={partner} />;
}
