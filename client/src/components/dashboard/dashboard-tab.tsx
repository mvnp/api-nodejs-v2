import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Activity, Shield, Database } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useQuery } from "@tanstack/react-query";

export function DashboardTab() {
  const { token } = useAuth();

  const { data: users, isLoading } = useQuery({
    queryKey: ["/api/users"],
    queryFn: async () => {
      const response = await fetch("/api/users", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }
      
      return response.json();
    },
    enabled: !!token,
  });

  const stats = [
    {
      title: "Total Users",
      value: isLoading ? "..." : users?.data?.users?.length || 0,
      description: "Registered users",
      icon: Users,
      change: "+12%",
      changeType: "positive" as const,
    },
    {
      title: "API Requests",
      value: "1,234",
      description: "Last 24 hours",
      icon: Activity,
      change: "+8%",
      changeType: "positive" as const,
    },
    {
      title: "Authentication",
      value: "JWT",
      description: "Security enabled",
      icon: Shield,
      change: "Active",
      changeType: "neutral" as const,
    },
    {
      title: "Database",
      value: "PostgreSQL",
      description: "Connected",
      icon: Database,
      change: "Online",
      changeType: "positive" as const,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome to your API management dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                <Badge
                  variant={
                    stat.changeType === "positive"
                      ? "default"
                      : stat.changeType === "negative"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest API endpoints usage
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">POST /api/login</p>
                <p className="text-xs text-muted-foreground">2 minutes ago</p>
              </div>
              <Badge variant="secondary">200</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">GET /api/users</p>
                <p className="text-xs text-muted-foreground">5 minutes ago</p>
              </div>
              <Badge variant="secondary">200</Badge>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium leading-none">POST /api/register</p>
                <p className="text-xs text-muted-foreground">10 minutes ago</p>
              </div>
              <Badge variant="secondary">201</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>
              Current system health
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Server</span>
              <Badge variant="default">Online</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Database</span>
              <Badge variant="default">Connected</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Authentication</span>
              <Badge variant="default">Active</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Documentation</span>
              <Badge variant="default">Available</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}