import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { organisation_name, country, website, status, notes, contact_name, contact_email, contact_phone } = body;

  if (!organisation_name || typeof organisation_name !== "string") {
    return NextResponse.json(
      { error: "organisation_name is required" },
      { status: 400 }
    );
  }

  const validStatuses = ["active", "inactive", "lead", "archived"];
  const partnerStatus = validStatuses.includes(status) ? status : "active";

  // Insert partner
  const { data: partner, error: partnerError } = await supabase
    .from("partners")
    .insert({
      organisation_name: organisation_name.trim(),
      country: country?.trim() || null,
      website: website?.trim() || null,
      status: partnerStatus,
      notes: notes?.trim() || null,
      created_by: user.id,
    })
    .select()
    .single();

  if (partnerError) {
    return NextResponse.json(
      { error: partnerError.message },
      { status: 500 }
    );
  }

  // Insert contact if provided
  let contact = null;
  if (contact_name || contact_email || contact_phone) {
    const { data: contactData, error: contactError } = await supabase
      .from("contacts")
      .insert({
        partner_id: partner.id,
        name: contact_name?.trim() || null,
        email: contact_email?.trim() || null,
        phone: contact_phone?.trim() || null,
        is_primary: true,
      })
      .select()
      .single();

    if (contactError) {
      return NextResponse.json(
        { error: contactError.message },
        { status: 500 }
      );
    }
    contact = contactData;
  }

  return NextResponse.json({ partner, contact }, { status: 201 });
}

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search");
  const status = searchParams.get("status");

  let query = supabase
    .from("partners")
    .select("*, contacts(*)")
    .order("organisation_name");

  if (status && status !== "all") {
    query = query.eq("status", status);
  }

  if (search) {
    query = query.ilike("organisation_name", `%${search}%`);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ partners: data });
}
