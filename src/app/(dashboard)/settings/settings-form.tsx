"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Save, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
};

const themes = [
  { id: "default" as const, name: "Default", color: "bg-zinc-800", emoji: "" },
  { id: "pink" as const, name: "Hello Kitty", color: "bg-pink-500", emoji: "🎀 💖" },
];

export function SettingsForm({ profile }: { profile: Profile | null }) {
  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", profile?.id);

      if (error) throw error;
      setMessage("Profile updated successfully.");
      router.refresh();
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordReset = async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      profile?.email || ""
    );
    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password reset email sent.");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={profile?.email || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            {message && (
              <p className="text-sm text-primary">{message}</p>
            )}
            <Button type="submit" disabled={saving}>
              <Save className="size-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="size-5" />
            Appearance
          </CardTitle>
          <CardDescription>Choose your colour theme</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  theme === t.id
                    ? "border-primary bg-accent"
                    : "border-border hover:border-muted-foreground/30"
                }`}
              >
                <div className={`size-8 rounded-full ${t.color}`} />
                <span className="font-medium text-sm">{t.emoji} {t.name} {t.emoji}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your password</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={handlePasswordReset}>
            Send Password Reset Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
