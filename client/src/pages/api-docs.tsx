import { useState } from "react";
import { ApiHeader } from "@/components/api-header";
import { ApiSidebar } from "@/components/api-sidebar";
import { ApiEndpointComponent } from "@/components/api-endpoint";
import { endpoints, statusCodes } from "@/lib/api-client";
import { Code, Shield } from "lucide-react";

export default function ApiDocs() {
  const [activeEndpoint, setActiveEndpoint] = useState('register');

  const currentEndpoint = endpoints.find(ep => ep.id === activeEndpoint);

  return (
    <div className="bg-gray-50 font-sans min-h-screen">
      <ApiHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <ApiSidebar 
            activeEndpoint={activeEndpoint} 
            onEndpointSelect={setActiveEndpoint} 
          />

          <main className="flex-1">
            {/* API Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">Laravel JWT Authentication API</h1>
                  <p className="text-gray-600 mb-4">RESTful API with JWT token-based authentication system for secure user management and protected routes.</p>
                  <div className="flex items-center space-x-4">
                    <span className="bg-gray-100 px-3 py-1 rounded-lg text-sm font-medium text-gray-700">
                      Base URL: <code className="font-mono">https://api.example.com</code>
                    </span>
                    <span className="bg-api-green/10 text-api-green px-3 py-1 rounded-lg text-sm font-medium">
                      <i className="fas fa-check-circle mr-1"></i>
                      Online
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-gradient-to-r from-api-blue to-api-purple p-4 rounded-xl text-white">
                    <Shield className="h-8 w-8 mb-2" />
                    <div className="text-sm font-semibold">Secured with JWT</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Current Endpoint */}
            <div className="space-y-6">
              {currentEndpoint && (
                <ApiEndpointComponent endpoint={currentEndpoint} />
              )}

              {/* Status Codes Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">HTTP Status Codes</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Success Codes</h3>
                    <div className="space-y-3">
                      {statusCodes
                        .filter(status => status.type === 'success')
                        .map((status) => (
                          <div key={status.code} className="flex items-center space-x-3">
                            <span className="bg-api-green text-white px-2 py-1 rounded text-xs font-mono w-12 text-center">
                              {status.code}
                            </span>
                            <span className="text-sm text-gray-700">{status.description}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Error Codes</h3>
                    <div className="space-y-3">
                      {statusCodes
                        .filter(status => status.type === 'error')
                        .map((status) => (
                          <div key={status.code} className="flex items-center space-x-3">
                            <span className="bg-api-red text-white px-2 py-1 rounded text-xs font-mono w-12 text-center">
                              {status.code}
                            </span>
                            <span className="text-sm text-gray-700">{status.description}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
