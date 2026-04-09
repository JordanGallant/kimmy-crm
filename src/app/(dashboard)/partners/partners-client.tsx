"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Plus, Globe, Mail, ExternalLink, UserPlus } from "lucide-react";

type Partner = {
  id: string;
  organisation_name: string;
  country: string | null;
  website: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  contacts: {
    id: string;
    name: string | null;
    email: string | null;
  }[];
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  lead: "bg-primary/10 text-primary",
  archived: "bg-orange-100 text-orange-700",
};

export function PartnersClient({ partners }: { partners: Partner[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    organisation_name: "",
    country: "",
    website: "",
    status: "active",
    notes: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const filtered = partners.filter((p) => {
    const matchesSearch =
      p.organisation_name.toLowerCase().includes(search.toLowerCase()) ||
      (p.country?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      p.contacts.some(
        (c) =>
          c.name?.toLowerCase().includes(search.toLowerCase()) ||
          c.email?.toLowerCase().includes(search.toLowerCase())
      );
    const matchesStatus = statusFilter === "all" || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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
          status: formData.status,
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
        status: "active",
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
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Partners</h2>
          <p className="text-muted-foreground text-sm">{filtered.length} partners</p>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => v && setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="lead">Lead</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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

      {/* Search & Filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search partners, contacts, countries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="lead">Lead</SelectItem>
            <SelectItem value="archived">Archived</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Partner List */}
      <div className="grid gap-3">
        {filtered.map((partner) => (
          <Link key={partner.id} href={`/partners/${partner.id}`}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardContent className="py-3 sm:py-4">
                <div className="flex items-start sm:items-center justify-between gap-2">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-sm sm:text-base truncate">
                        {partner.organisation_name}
                      </p>
                      <Badge variant="secondary" className={`text-xs ${statusColors[partner.status]}`}>
                        {partner.status}
                      </Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-muted-foreground">
                      {partner.country && (
                        <span className="flex items-center gap-1">
                          <Globe className="size-3" />
                          {partner.country.trim()}
                        </span>
                      )}
                      {partner.contacts[0]?.email && (
                        <span className="flex items-center gap-1 truncate max-w-[200px]">
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">{partner.contacts[0].email.trim()}</span>
                        </span>
                      )}
                      {partner.website && (
                        <span className="hidden sm:flex items-center gap-1 truncate max-w-[200px]">
                          <ExternalLink className="size-3 shrink-0" />
                          <span className="truncate">
                            {partner.website.replace(/https?:\/\//, "").replace(/\/$/, "").trim()}
                          </span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground whitespace-nowrap">
                    {partner.contacts.length} contact{partner.contacts.length !== 1 ? "s" : ""}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No partners found.
          </div>
        )}
      </div>

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
