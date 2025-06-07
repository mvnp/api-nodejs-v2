import { Play, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ApiEndpoint } from "@/lib/api-client";
import { useState } from "react";

interface ApiEndpointProps {
  endpoint: ApiEndpoint;
}

export function ApiEndpointComponent({ endpoint }: ApiEndpointProps) {
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET':
        return 'bg-api-blue text-white';
      case 'POST':
        return 'bg-api-green text-white';
      case 'PUT':
        return 'bg-api-orange text-white';
      case 'DELETE':
        return 'bg-api-red text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (code: string) => {
    if (code.startsWith('2')) return 'bg-api-green text-white';
    if (code.startsWith('4') || code.startsWith('5')) return 'bg-api-red text-white';
    return 'bg-gray-500 text-white';
  };

  const handleTryItOut = () => {
    setIsTestModalOpen(true);
    // In a real implementation, this would open an interactive API testing interface
    console.log('Opening API tester for endpoint:', endpoint.path);
  };

  return (
    <div id={endpoint.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center space-x-4 mb-4">
          <span className={`px-3 py-1 rounded-lg text-sm font-mono font-semibold ${getMethodColor(endpoint.method)}`}>
            {endpoint.method}
          </span>
          <h2 className="text-xl font-semibold text-gray-900">{endpoint.path}</h2>
          <span className="text-gray-500">{endpoint.title}</span>
          {endpoint.protected && (
            <span className="bg-api-orange/10 text-api-orange px-2 py-1 rounded text-xs font-medium">
              <Lock className="inline h-3 w-3 mr-1" />
              Protected
            </span>
          )}
        </div>
        <p className="text-gray-600">{endpoint.description}</p>
      </div>
      
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Request */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Request</h3>
            <div className="space-y-4">
              {endpoint.headers && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Headers</h4>
                  <div className={`p-4 rounded-lg ${endpoint.protected ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'}`}>
                    <code className="text-sm font-mono text-gray-800">
                      {Object.entries(endpoint.headers).map(([key, value]) => (
                        <span key={key}>
                          {key}: {value}<br />
                        </span>
                      ))}
                    </code>
                  </div>
                </div>
              )}
              {endpoint.requestBody && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Body (JSON)</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-sm font-mono text-gray-800">
                      {JSON.stringify(endpoint.requestBody, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="bg-api-green text-white px-2 py-1 rounded text-xs font-mono">
                  {endpoint.method === 'POST' && endpoint.id === 'register' ? '201' : '200'}
                </span>
                <span className="text-sm text-gray-600">
                  {endpoint.method === 'POST' && endpoint.id === 'register' ? 'Created' : 'OK'}
                </span>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm font-mono text-gray-800">
                  {JSON.stringify(endpoint.responseExample, null, 2)}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Error Response */}
        {endpoint.errorExample && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Response</h4>
            <div className="flex items-center space-x-2 mb-2">
              <span className="bg-api-red text-white px-2 py-1 rounded text-xs font-mono">401</span>
              <span className="text-sm text-gray-600">Unauthorized</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm font-mono text-gray-800">
                {JSON.stringify(endpoint.errorExample, null, 2)}
              </pre>
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-200">
          <Button 
            onClick={handleTryItOut}
            className={`${getMethodColor(endpoint.method)} hover:opacity-90 transition-opacity`}
          >
            <Play className="h-4 w-4 mr-2" />
            Try it out
          </Button>
        </div>
      </div>
    </div>
  );
}
