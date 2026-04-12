"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarProps = {
  user: any;
  profile: any;
};

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/partners", label: "Partners", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

function SidebarContent({
  user,
  profile,
  onNavigate,
}: SidebarProps & { onNavigate?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      <div className="p-5 space-y-3">
        <div className="flex items-center gap-2.5">
          <Image src="/logo.png" alt="Kimmy CRM" width={32} height={32} className="rounded-md" />
          <h1 className="text-lg font-semibold tracking-tight">Kimmy CRM</h1>
        </div>
        <div className="flex items-center gap-3 px-1">
          <Image src="/logo-dice.png" alt="DICE Consortium" width={80} height={28} className="object-contain" />
          <Image src="/logo-p2e.png" alt="P2E International" width={48} height={28} className="object-contain" />
        </div>
      </div>
      <Separator />
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <Separator />
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-3 px-3">
          <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-sm font-bold">
            {(profile?.full_name?.[0] || user.email?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {profile?.full_name || "User"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.email}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export function Sidebar({ user, profile }: SidebarProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 border-b border-border bg-card px-4 py-3">
        <button onClick={() => setOpen(true)}>
          <Menu className="size-6" />
        </button>
        <Image src="/logo.png" alt="Kimmy CRM" width={24} height={24} className="rounded-md" />
        <span className="text-base font-semibold tracking-tight">Kimmy CRM</span>
      </div>

      {/* Mobile overlay */}
      {open && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Mobile slide-out */}
      <aside
        className={cn(
          "md:hidden fixed inset-y-0 left-0 z-50 w-64 bg-card flex flex-col transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-4 right-4">
          <button onClick={() => setOpen(false)}>
            <X className="size-5" />
          </button>
        </div>
        <SidebarContent
          user={user}
          profile={profile}
          onNavigate={() => setOpen(false)}
        />
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 border-r border-border bg-card flex-col h-full">
        <SidebarContent user={user} profile={profile} />
      </aside>
    </>
  );
}
