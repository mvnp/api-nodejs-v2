import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { Play, Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ApiRequest {
  method: string;
  endpoint: string;
  headers: Record<string, string>;
  body: string;
}

interface ApiResponse {
  status: number;
  statusText: string;
  headers: Record<string, string>;
  data: any;
  time: number;
}

export function ApiTesterTab() {
  const { token } = useAuth();
  const { toast } = useToast();
  const [request, setRequest] = useState<ApiRequest>({
    method: "GET",
    endpoint: "/api/user/profile",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token || ""}`,
    },
    body: "",
  });
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const predefinedEndpoints = [
    { method: "POST", path: "/api/register", body: '{\n  "name": "John Doe",\n  "email": "john@example.com",\n  "password": "password123",\n  "password_confirmation": "password123"\n}' },
    { method: "POST", path: "/api/login", body: '{\n  "email": "john@example.com",\n  "password": "password123"\n}' },
    { method: "GET", path: "/api/user/profile", body: "" },
    { method: "PUT", path: "/api/user/profile", body: '{\n  "name": "John Updated",\n  "email": "john.updated@example.com"\n}' },
    { method: "GET", path: "/api/users", body: "" },
    { method: "POST", path: "/api/refresh", body: "" },
    { method: "POST", path: "/api/logout", body: "" },
  ];

  const handleSendRequest = async () => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const url = `${window.location.origin}${request.endpoint}`;
      const options: RequestInit = {
        method: request.method,
        headers: request.headers,
      };

      if (request.method !== "GET" && request.body) {
        options.body = request.body;
      }

      const res = await fetch(url, options);
      const endTime = Date.now();
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
        data,
        time: endTime - startTime,
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: "Network Error",
        headers: {},
        data: { error: error instanceof Error ? error.message : "Unknown error" },
        time: Date.now() - startTime,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeaderValue = (key: string, value: string) => {
    setRequest(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        [key]: value,
      },
    }));
  };

  const addHeader = () => {
    const key = prompt("Header name:");
    if (key) {
      updateHeaderValue(key, "");
    }
  };

  const removeHeader = (key: string) => {
    setRequest(prev => ({
      ...prev,
      headers: Object.fromEntries(
        Object.entries(prev.headers).filter(([k]) => k !== key)
      ),
    }));
  };

  const loadPresetEndpoint = (preset: typeof predefinedEndpoints[0]) => {
    setRequest(prev => ({
      ...prev,
      method: preset.method,
      endpoint: preset.path,
      body: preset.body,
      headers: {
        ...prev.headers,
        "Content-Type": preset.body ? "application/json" : prev.headers["Content-Type"],
      },
    }));
  };

  const copyResponse = () => {
    navigator.clipboard.writeText(JSON.stringify(response?.data, null, 2));
    toast({
      title: "Copied",
      description: "Response copied to clipboard",
    });
  };

  const getStatusColor = (status: number) => {
    if (status >= 200 && status < 300) return "default";
    if (status >= 400 && status < 500) return "destructive";
    if (status >= 500) return "destructive";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">API Tester</h2>
          <p className="text-muted-foreground">
            Test your API endpoints directly from the dashboard
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/api-docs" target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Swagger
          </a>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Request</CardTitle>
            <CardDescription>Configure your API request</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex space-x-2">
              <Select value={request.method} onValueChange={(value) => setRequest(prev => ({ ...prev, method: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GET">GET</SelectItem>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="DELETE">DELETE</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Enter endpoint URL"
                value={request.endpoint}
                onChange={(e) => setRequest(prev => ({ ...prev, endpoint: e.target.value }))}
                className="flex-1"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-2 block">Quick Presets</Label>
              <div className="flex flex-wrap gap-2">
                {predefinedEndpoints.map((preset, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => loadPresetEndpoint(preset)}
                    className="text-xs"
                  >
                    {preset.method} {preset.path}
                  </Button>
                ))}
              </div>
            </div>

            <Tabs defaultValue="headers">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="headers">Headers</TabsTrigger>
                <TabsTrigger value="body">Body</TabsTrigger>
              </TabsList>
              
              <TabsContent value="headers" className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Headers</Label>
                  <Button variant="outline" size="sm" onClick={addHeader}>
                    Add Header
                  </Button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {Object.entries(request.headers).map(([key, value]) => (
                    <div key={key} className="flex space-x-2">
                      <Input
                        placeholder="Header name"
                        value={key}
                        onChange={(e) => {
                          const newHeaders = { ...request.headers };
                          delete newHeaders[key];
                          newHeaders[e.target.value] = value;
                          setRequest(prev => ({ ...prev, headers: newHeaders }));
                        }}
                        className="flex-1"
                      />
                      <Input
                        placeholder="Header value"
                        value={value}
                        onChange={(e) => updateHeaderValue(key, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeHeader(key)}
                      >
                        ×
                      </Button>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="body">
                <div className="space-y-2">
                  <Label htmlFor="body">Request Body (JSON)</Label>
                  <Textarea
                    id="body"
                    placeholder="Enter JSON request body..."
                    value={request.body}
                    onChange={(e) => setRequest(prev => ({ ...prev, body: e.target.value }))}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <Button onClick={handleSendRequest} disabled={isLoading} className="w-full">
              <Play className="w-4 h-4 mr-2" />
              {isLoading ? "Sending..." : "Send Request"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Response
              {response && (
                <div className="flex items-center space-x-2">
                  <Badge variant={getStatusColor(response.status)}>
                    {response.status} {response.statusText}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {response.time}ms
                  </span>
                  <Button variant="outline" size="sm" onClick={copyResponse}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </CardTitle>
            <CardDescription>API response details</CardDescription>
          </CardHeader>
          <CardContent>
            {!response ? (
              <div className="flex items-center justify-center h-64 text-muted-foreground">
                No response yet. Send a request to see the result.
              </div>
            ) : (
              <Tabs defaultValue="response">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="response">Response</TabsTrigger>
                  <TabsTrigger value="headers">Headers</TabsTrigger>
                </TabsList>
                
                <TabsContent value="response">
                  <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto max-h-96">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </TabsContent>
                
                <TabsContent value="headers">
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {Object.entries(response.headers).map(([key, value]) => (
                      <div key={key} className="flex justify-between text-sm">
                        <span className="font-medium">{key}:</span>
                        <span className="text-muted-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}