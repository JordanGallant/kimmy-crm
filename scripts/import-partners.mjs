#!/usr/bin/env node

/**
 * Import Partners.xlsx into Supabase
 * Usage: node scripts/import-partners.mjs
 *
 * Requires: npm install xlsx (dev dep)
 */

import { readFileSync } from "fs";
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

// Load .env.local
config({ path: ".env.local" });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function main() {
  const XLSX = (await import("xlsx")).default;

  const workbook = XLSX.readFile("Partners.xlsx");
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet);

  console.log(`Found ${rows.length} rows in Partners.xlsx\n`);

  let imported = 0;
  let skipped = 0;

  for (const row of rows) {
    const orgName = (row["Organisation Name"] || "").toString().trim();
    if (!orgName) {
      skipped++;
      continue;
    }

    const country = (row["Country"] || "").toString().trim() || null;
    const contactName = (row["Contact Name"] || "").toString().trim() || null;
    const rawEmail = (row["Email"] || "").toString().trim() || null;
    const website = (row["Website"] || "").toString().trim() || null;

    // Clean up emails - split on ; and take valid ones
    const emails = rawEmail
      ? rawEmail
          .split(";")
          .map((e) => e.trim())
          .filter((e) => e.includes("@"))
      : [];

    // Insert partner
    const { data: partner, error: partnerError } = await supabase
      .from("partners")
      .insert({
        organisation_name: orgName,
        country,
        website,
        status: "active",
      })
      .select("id")
      .single();

    if (partnerError) {
      console.error(`Failed to insert "${orgName}":`, partnerError.message);
      skipped++;
      continue;
    }

    // Insert primary contact if we have name or email
    if (contactName || emails.length > 0) {
      const { error: contactError } = await supabase.from("contacts").insert({
        partner_id: partner.id,
        name: contactName,
        email: emails[0] || null,
        is_primary: true,
      });

      if (contactError) {
        console.error(`  Contact error for "${orgName}":`, contactError.message);
      }

      // If there are additional emails, create extra contacts
      for (let i = 1; i < emails.length; i++) {
        await supabase.from("contacts").insert({
          partner_id: partner.id,
          email: emails[i],
          is_primary: false,
        });
      }
    }

    imported++;
    process.stdout.write(`\rImported ${imported}/${rows.length}...`);
  }

  console.log(`\n\nDone! Imported: ${imported}, Skipped: ${skipped}`);
}

main().catch(console.error);
