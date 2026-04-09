"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  UserPlus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

type Partner = {
  id: string;
  organisation_name: string;
  country: string | null;
  website: string | null;
  notes: string | null;
  created_at: string;
  contacts: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
};

type SortKey = "organisation_name" | "country" | "contact" | "created_at";
type SortDir = "asc" | "desc";

const PAGE_SIZE = 25;

export function PartnersClient({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("organisation_name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [page, setPage] = useState(0);
  const [formData, setFormData] = useState({
    organisation_name: "",
    country: "",
    website: "",
    notes: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return partners.filter(
      (p) =>
        p.organisation_name.toLowerCase().includes(q) ||
        (p.country?.toLowerCase().includes(q) ?? false) ||
        p.contacts.some(
          (c) =>
            c.name?.toLowerCase().includes(q) ||
            c.email?.toLowerCase().includes(q)
        )
    );
  }, [partners, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      let aVal = "";
      let bVal = "";
      switch (sortKey) {
        case "organisation_name":
          aVal = a.organisation_name.toLowerCase();
          bVal = b.organisation_name.toLowerCase();
          break;
        case "country":
          aVal = (a.country || "").toLowerCase();
          bVal = (b.country || "").toLowerCase();
          break;
        case "contact":
          aVal = (a.contacts[0]?.name || a.contacts[0]?.email || "").toLowerCase();
          bVal = (b.contacts[0]?.name || b.contacts[0]?.email || "").toLowerCase();
          break;
        case "created_at":
          aVal = a.created_at;
          bVal = b.created_at;
          break;
      }
      if (aVal < bVal) return sortDir === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [filtered, sortKey, sortDir]);

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
    setPage(0);
  };

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ArrowUpDown className="size-3 opacity-30" />;
    return sortDir === "asc" ? (
      <ArrowUp className="size-3" />
    ) : (
      <ArrowDown className="size-3" />
    );
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    try {
      const { data: partner, error } = await supabase
        .from("partners")
        .insert({
          organisation_name: formData.organisation_name,
          country: formData.country || null,
          website: formData.website || null,
          notes: formData.notes || null,
        })
        .select()
        .single();

      if (error) throw error;

      if (formData.contact_name || formData.contact_email || formData.contact_phone) {
        await supabase.from("contacts").insert({
          partner_id: partner.id,
          name: formData.contact_name || null,
          email: formData.contact_email || null,
          phone: formData.contact_phone || null,
          is_primary: true,
        });
      }

      setDialogOpen(false);
      setFormData({
        organisation_name: "",
        country: "",
        website: "",
        notes: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Partners</h2>
          <p className="text-muted-foreground text-sm">{filtered.length} total</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger>
            <Button className="w-full sm:w-auto">
              <UserPlus className="size-4 mr-2" />
              Add to CRM
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add to CRM</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="org_name">Organisation Name *</Label>
                <Input
                  id="org_name"
                  value={formData.organisation_name}
                  onChange={(e) =>
                    setFormData({ ...formData, organisation_name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="border-t pt-4">
                <p className="text-sm font-medium mb-3">Contact Person</p>
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Name</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) =>
                        setFormData({ ...formData, contact_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="contact_email">Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={formData.contact_email}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact_phone">Phone</Label>
                      <Input
                        id="contact_phone"
                        type="tel"
                        value={formData.contact_phone}
                        onChange={(e) =>
                          setFormData({ ...formData, contact_phone: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full" disabled={saving}>
                {saving ? "Saving..." : "Add to CRM"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, country, contact..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(0);
          }}
          className="pl-10"
        />
      </div>

      {/* Table — desktop */}
      <div className="hidden md:block border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => toggleSort("organisation_name")}
                  className="flex items-center gap-1 hover:text-foreground text-muted-foreground"
                >
                  Organisation <SortIcon col="organisation_name" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => toggleSort("country")}
                  className="flex items-center gap-1 hover:text-foreground text-muted-foreground"
                >
                  Country <SortIcon col="country" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">
                <button
                  onClick={() => toggleSort("contact")}
                  className="flex items-center gap-1 hover:text-foreground text-muted-foreground"
                >
                  Contact <SortIcon col="contact" />
                </button>
              </th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Website</th>
            </tr>
          </thead>
          <tbody>
            {paged.map((partner) => (
              <tr
                key={partner.id}
                className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
              >
                <td className="p-3">
                  <Link
                    href={`/partners/${partner.id}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {partner.organisation_name}
                  </Link>
                </td>
                <td className="p-3 text-muted-foreground">
                  {partner.country?.trim() || "—"}
                </td>
                <td className="p-3 text-muted-foreground">
                  {partner.contacts[0]?.name || "—"}
                </td>
                <td className="p-3">
                  {partner.contacts[0]?.email ? (
                    <a
                      href={`mailto:${partner.contacts[0].email.trim()}`}
                      className="text-primary hover:underline truncate block max-w-[200px]"
                    >
                      {partner.contacts[0].email.trim()}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="p-3">
                  {partner.website ? (
                    <a
                      href={
                        partner.website.startsWith("http")
                          ? partner.website
                          : `https://${partner.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate block max-w-[180px]"
                    >
                      {partner.website
                        .replace(/https?:\/\//, "")
                        .replace(/\/$/, "")
                        .trim()}
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
              </tr>
            ))}
            {paged.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No partners found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards — mobile */}
      <div className="md:hidden grid gap-2">
        {paged.map((partner) => (
          <Link key={partner.id} href={`/partners/${partner.id}`}>
            <div className="p-3 border rounded-lg hover:bg-muted/30 transition-colors">
              <p className="font-medium text-sm">{partner.organisation_name}</p>
              <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                {partner.country && <span>{partner.country.trim()}</span>}
                {partner.contacts[0]?.email && (
                  <span className="truncate max-w-[180px]">
                    {partner.contacts[0].email.trim()}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
        {paged.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No partners found.
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-muted-foreground">
            {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of{" "}
            {sorted.length}
          </p>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages - 1}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Mobile FAB */}
      <button
        onClick={() => setDialogOpen(true)}
        className="md:hidden fixed bottom-6 right-6 z-40 size-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus className="size-6" />
      </button>
    </div>
  );
}
