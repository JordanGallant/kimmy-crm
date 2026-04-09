"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
import {
  ArrowLeft,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Globe,
  Mail,
  Phone,
  User,
} from "lucide-react";

type Contact = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  job_title: string | null;
  is_primary: boolean;
};

type Activity = {
  id: string;
  type: string;
  title: string;
  description: string | null;
  created_at: string;
};

type Partner = {
  id: string;
  organisation_name: string;
  country: string | null;
  website: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
  contacts: Contact[];
  activities: Activity[];
};

const statusColors: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  lead: "bg-primary/10 text-primary",
  archived: "bg-orange-100 text-orange-700",
};

const activityIcons: Record<string, string> = {
  note: "📝",
  email: "📧",
  call: "📞",
  meeting: "🤝",
  other: "📌",
};

export function PartnerDetail({ partner }: { partner: Partner }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    organisation_name: partner.organisation_name,
    country: partner.country || "",
    website: partner.website || "",
    status: partner.status,
    notes: partner.notes || "",
  });
  const [contactDialog, setContactDialog] = useState(false);
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    job_title: "",
  });
  const [activityDialog, setActivityDialog] = useState(false);
  const [activityForm, setActivityForm] = useState({
    type: "note",
    title: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase
        .from("partners")
        .update({
          organisation_name: form.organisation_name,
          country: form.country || null,
          website: form.website || null,
          status: form.status,
          notes: form.notes || null,
        })
        .eq("id", partner.id);
      if (error) throw error;
      setEditing(false);
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this partner?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("partners").delete().eq("id", partner.id);
    if (error) {
      alert(error.message);
      return;
    }
    router.push("/partners");
    router.refresh();
  };

  const handleAddContact = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("contacts").insert({
        partner_id: partner.id,
        name: contactForm.name || null,
        email: contactForm.email || null,
        phone: contactForm.phone || null,
        job_title: contactForm.job_title || null,
        is_primary: partner.contacts.length === 0,
      });
      if (error) throw error;
      setContactDialog(false);
      setContactForm({ name: "", email: "", phone: "", job_title: "" });
      router.refresh();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm("Delete this contact?")) return;
    const supabase = createClient();
    await supabase.from("contacts").delete().eq("id", contactId);
    router.refresh();
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const supabase = createClient();
    try {
      const { error } = await supabase.from("activities").insert({
        partner_id: partner.id,
        type: activityForm.type,
        title: activityForm.title,
        description: activityForm.description || null,
      });
      if (error) throw error;
      setActivityDialog(false);
      setActivityForm({ type: "note", title: "", description: "" });
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
      <div className="flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <Link href="/partners">
            <Button variant="ghost" size="icon" className="shrink-0 mt-1">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div className="flex-1 min-w-0">
            <h2 className="text-xl sm:text-3xl font-bold tracking-tight break-words">
              {partner.organisation_name}
            </h2>
            <p className="text-sm text-muted-foreground">
              Added {new Date(partner.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave} disabled={saving} className="flex-1 sm:flex-none">
                <Save className="size-4 mr-2" />
                {saving ? "Saving..." : "Save"}
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                <X className="size-4" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setEditing(true)} className="flex-1 sm:flex-none">
                <Edit className="size-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={handleDelete} className="flex-1 sm:flex-none">
                <Trash2 className="size-4 mr-2" />
                Delete
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content — contacts first on mobile (above details) */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
        {/* Contacts — shows first on mobile */}
        <div className="order-first md:order-last space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Contacts</CardTitle>
              <Dialog open={contactDialog} onOpenChange={setContactDialog}>
                <DialogTrigger>
                  <Button size="sm">
                    <Plus className="size-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Add Contact</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddContact} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input
                        value={contactForm.name}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, name: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email</Label>
                      <Input
                        type="email"
                        value={contactForm.email}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={contactForm.phone}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, phone: e.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Job Title</Label>
                      <Input
                        value={contactForm.job_title}
                        onChange={(e) =>
                          setContactForm({ ...contactForm, job_title: e.target.value })
                        }
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Saving..." : "Add Contact"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {partner.contacts.length > 0 ? (
                <div className="space-y-3">
                  {partner.contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-start justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        {contact.name && (
                          <div className="flex items-center gap-2 text-sm font-medium">
                            <User className="size-3 shrink-0" />
                            <span className="truncate">{contact.name}</span>
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="size-3 shrink-0" />
                            <a
                              href={`mailto:${contact.email}`}
                              className="hover:text-primary truncate"
                            >
                              {contact.email.trim()}
                            </a>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="size-3 shrink-0" />
                            <a href={`tel:${contact.phone}`} className="hover:text-primary">
                              {contact.phone}
                            </a>
                          </div>
                        )}
                        {contact.job_title && (
                          <p className="text-xs text-muted-foreground">{contact.job_title}</p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteContact(contact.id)}
                        className="shrink-0"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No contacts yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Details & Activity */}
        <div className="md:col-span-2 space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {editing ? (
                <>
                  <div className="space-y-2">
                    <Label>Organisation Name</Label>
                    <Input
                      value={form.organisation_name}
                      onChange={(e) =>
                        setForm({ ...form, organisation_name: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Country</Label>
                      <Input
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={form.status}
                        onValueChange={(v) => v && setForm({ ...form, status: v })}
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
                    <Label>Website</Label>
                    <Input
                      value={form.website}
                      onChange={(e) => setForm({ ...form, website: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      rows={4}
                    />
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[partner.status]}>{partner.status}</Badge>
                  </div>
                  {partner.country && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="size-4 text-muted-foreground shrink-0" />
                      {partner.country.trim()}
                    </div>
                  )}
                  {partner.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="size-4 text-muted-foreground shrink-0" />
                      <a
                        href={
                          partner.website.startsWith("http")
                            ? partner.website
                            : `https://${partner.website}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline truncate"
                      >
                        {partner.website.trim()}
                      </a>
                    </div>
                  )}
                  {partner.notes && (
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                        {partner.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Activity</CardTitle>
              <Dialog open={activityDialog} onOpenChange={setActivityDialog}>
                <DialogTrigger>
                  <Button size="sm">
                    <Plus className="size-4 mr-1" />
                    Add
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Log Activity</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleAddActivity} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={activityForm.type}
                        onValueChange={(v) =>
                          v && setActivityForm({ ...activityForm, type: v })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="note">Note</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Title</Label>
                      <Input
                        value={activityForm.title}
                        onChange={(e) =>
                          setActivityForm({ ...activityForm, title: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea
                        value={activityForm.description}
                        onChange={(e) =>
                          setActivityForm({
                            ...activityForm,
                            description: e.target.value,
                          })
                        }
                        rows={3}
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={saving}>
                      {saving ? "Saving..." : "Log Activity"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {partner.activities.length > 0 ? (
                <div className="space-y-4">
                  {partner.activities
                    .sort(
                      (a, b) =>
                        new Date(b.created_at).getTime() -
                        new Date(a.created_at).getTime()
                    )
                    .map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <span className="text-lg shrink-0">
                          {activityIcons[activity.type] || "📌"}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                            <p className="text-sm font-medium">{activity.title}</p>
                            <span className="text-xs text-muted-foreground">
                              {new Date(activity.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          {activity.description && (
                            <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">
                              {activity.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity logged yet.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
