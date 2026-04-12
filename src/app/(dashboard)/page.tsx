import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Activity } from "lucide-react";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();

  const { count: partnerCount } = await supabase
    .from("partners")
    .select("*", { count: "exact", head: true });

  const { count: contactCount } = await supabase
    .from("contacts")
    .select("*", { count: "exact", head: true });

  const { count: activityCount } = await supabase
    .from("activities")
    .select("*", { count: "exact", head: true });

  const { data: recentPartners } = await supabase
    .from("partners")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  const { data: recentActivities } = await supabase
    .from("activities")
    .select("*, partners(organisation_name)")
    .order("created_at", { ascending: false })
    .limit(5);

  const stats = [
    { title: "Partners", value: partnerCount ?? 0, icon: Users },
    { title: "Contacts", value: contactCount ?? 0, icon: Mail },
    { title: "Activities", value: activityCount ?? 0, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Welcome to Amin CRM</p>
      </div>

      <div className="grid gap-4 grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Partners</CardTitle>
          </CardHeader>
          <CardContent>
            {recentPartners && recentPartners.length > 0 ? (
              <div className="space-y-3">
                {recentPartners.map((partner: any) => (
                  <Link
                    key={partner.id}
                    href={`/partners/${partner.id}`}
                    className="flex items-center justify-between hover:bg-muted/50 -mx-2 px-2 py-1 rounded-lg transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{partner.organisation_name}</p>
                      <p className="text-xs text-muted-foreground">{partner.country || "—"}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No partners yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivities && recentActivities.length > 0 ? (
              <div className="space-y-3">
                {recentActivities.map((activity: any) => (
                  <div key={activity.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.partners?.organisation_name}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No activity yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
