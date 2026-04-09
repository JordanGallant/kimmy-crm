import { createClient } from "@/lib/supabase/server";
import { PartnersClient } from "./partners-client";

export default async function PartnersPage() {
  const supabase = await createClient();

  const { data: partners } = await supabase
    .from("partners")
    .select("*, contacts(*)")
    .order("organisation_name");

  return <PartnersClient partners={partners ?? []} />;
}
