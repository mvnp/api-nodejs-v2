import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/theme-context";
import { Badge } from "@/components/ui/badge";
import { Moon, Sun, Palette, Shield, Database, Code } from "lucide-react";

export function SettingsTab() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Settings</h2>
        <p className="text-muted-foreground">
          Manage your preferences and application settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Palette className="h-4 w-4" />
              <span>Appearance</span>
            </CardTitle>
            <CardDescription>
              Customize the look and feel of your dashboard
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle between light and dark themes
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {theme === "light" ? (
                  <Sun className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Moon className="h-4 w-4 text-muted-foreground" />
                )}
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                Current theme: <Badge variant="outline">{theme === "dark" ? "Dark" : "Light"}</Badge>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-4 w-4" />
              <span>Security</span>
            </CardTitle>
            <CardDescription>
              Security settings and authentication preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">JWT Authentication</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Password Encryption</span>
                <Badge variant="default">bcrypt</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Token Expiry</span>
                <Badge variant="outline">1 hour</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Database className="h-4 w-4" />
              <span>Database</span>
            </CardTitle>
            <CardDescription>
              Database connection and storage information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Database Type</span>
                <Badge variant="default">PostgreSQL</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Connection Status</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">ORM</span>
                <Badge variant="outline">Drizzle</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Code className="h-4 w-4" />
              <span>API</span>
            </CardTitle>
            <CardDescription>
              API configuration and documentation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">API Version</span>
                <Badge variant="outline">v1.0.0</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Documentation</span>
                <Badge variant="default">Swagger/OpenAPI</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Base URL</span>
                <Badge variant="outline">/api</Badge>
              </div>
            </div>
            
            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full" asChild>
                <a href="/api-docs" target="_blank" rel="noopener noreferrer">
                  View API Documentation
                </a>
              </Button>
              <Button variant="outline" className="w-full" asChild>
                <a href="/api/swagger.json" target="_blank" rel="noopener noreferrer">
                  Download OpenAPI Spec
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>About</CardTitle>
          <CardDescription>
            Information about this application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Technology Stack</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Node.js + Express.js backend</li>
                <li>• React + TypeScript frontend</li>
                <li>• PostgreSQL database</li>
                <li>• JWT authentication</li>
                <li>• Tailwind CSS styling</li>
                <li>• Swagger/OpenAPI documentation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• User registration and authentication</li>
                <li>• Profile management</li>
                <li>• User administration</li>
                <li>• API testing interface</li>
                <li>• Light/dark theme support</li>
                <li>• Responsive design</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}