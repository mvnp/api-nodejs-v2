import { Download, Code, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ApiHeader() {
  const handleExportOpenAPI = async () => {
    try {
      const response = await fetch('/api/docs');
      const openApiDoc = await response.json();
      
      const blob = new Blob([JSON.stringify(openApiDoc, null, 2)], {
        type: 'application/json'
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'openapi.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export OpenAPI spec:', error);
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <Code className="h-5 w-5 text-api-blue" />
              <h1 className="text-xl font-semibold text-gray-900">Laravel API Documentation</h1>
            </div>
            <span className="bg-api-green/10 text-api-green px-2 py-1 rounded-md text-xs font-medium">v1.0.0</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Shield className="h-4 w-4 text-api-blue" />
              <span>JWT Authentication</span>
            </div>
            <Button 
              onClick={handleExportOpenAPI}
              className="bg-api-blue text-white hover:bg-blue-700 transition-colors"
              size="sm"
            >
              <Download className="h-4 w-4 mr-2" />
              Export OpenAPI
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
