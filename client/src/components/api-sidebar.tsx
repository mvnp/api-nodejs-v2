import { categories, endpoints } from "@/lib/api-client";

interface ApiSidebarProps {
  activeEndpoint: string;
  onEndpointSelect: (endpointId: string) => void;
}

export function ApiSidebar({ activeEndpoint, onEndpointSelect }: ApiSidebarProps) {
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

  return (
    <aside className="w-80 bg-white rounded-xl shadow-sm border border-gray-200 h-fit sticky top-24">
      <div className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Endpoints</h2>
        
        {categories.map((category) => (
          <div key={category.name} className="mb-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <i className={`${category.icon} mr-2 ${category.color}`}></i>
              {category.name}
            </h3>
            <ul className="space-y-2">
              {endpoints
                .filter(endpoint => endpoint.category === category.name)
                .map((endpoint) => (
                  <li key={endpoint.id}>
                    <button
                      onClick={() => onEndpointSelect(endpoint.id)}
                      className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-colors text-left ${
                        activeEndpoint === endpoint.id 
                          ? 'bg-blue-50 text-api-blue' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${getMethodColor(endpoint.method)}`}>
                        {endpoint.method}
                      </span>
                      <span className="text-sm text-gray-700">{endpoint.path}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}

        {/* JWT Info */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-semibold text-api-blue mb-2">JWT Authentication</h4>
          <p className="text-xs text-gray-600 mb-3">Include the JWT token in the Authorization header:</p>
          <code className="block bg-white p-2 rounded text-xs font-mono text-gray-800 border">
            Authorization: Bearer {'{token}'}
          </code>
        </div>
      </div>
    </aside>
  );
}
