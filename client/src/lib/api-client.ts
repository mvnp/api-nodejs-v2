export interface ApiEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  title: string;
  description: string;
  category: string;
  protected: boolean;
  requestBody?: object;
  responseExample?: object;
  errorExample?: object;
  headers?: Record<string, string>;
}

export const endpoints: ApiEndpoint[] = [
  {
    id: 'register',
    method: 'POST',
    path: '/api/register',
    title: 'Register a new user',
    description: 'Create a new user account and receive JWT authentication token.',
    category: 'Authentication',
    protected: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    requestBody: {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      password_confirmation: 'password123'
    },
    responseExample: {
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z'
        },
        token: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
        token_type: 'bearer',
        expires_in: 3600
      }
    }
  },
  {
    id: 'login',
    method: 'POST',
    path: '/api/login',
    title: 'Authenticate user',
    description: 'Authenticate user credentials and receive JWT token for API access.',
    category: 'Authentication',
    protected: false,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    requestBody: {
      email: 'john@example.com',
      password: 'password123'
    },
    responseExample: {
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com'
        },
        token: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
        token_type: 'bearer',
        expires_in: 3600
      }
    },
    errorExample: {
      success: false,
      message: 'Invalid credentials',
      errors: {
        email: ['The provided credentials are incorrect.']
      }
    }
  },
  {
    id: 'refresh',
    method: 'POST',
    path: '/api/refresh',
    title: 'Refresh JWT token',
    description: 'Get a new JWT token using the current valid token.',
    category: 'Authentication',
    protected: true,
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...',
      'Accept': 'application/json'
    },
    responseExample: {
      success: true,
      message: 'Token refreshed successfully',
      data: {
        token: 'eyJ0eXAiOiJKV1QiLCJhbGc...',
        token_type: 'bearer',
        expires_in: 3600
      }
    }
  },
  {
    id: 'logout',
    method: 'POST',
    path: '/api/logout',
    title: 'Logout user',
    description: 'Logout the authenticated user and invalidate the token.',
    category: 'Authentication',
    protected: true,
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...',
      'Accept': 'application/json'
    },
    responseExample: {
      success: true,
      message: 'Successfully logged out'
    }
  },
  {
    id: 'profile',
    method: 'GET',
    path: '/api/user/profile',
    title: "Get user's profile",
    description: "Get authenticated user's profile information. Requires valid JWT token.",
    category: 'User Management',
    protected: true,
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...',
      'Accept': 'application/json'
    },
    responseExample: {
      success: true,
      data: {
        user: {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          email_verified_at: null,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:30:00.000Z'
        }
      }
    }
  },
  {
    id: 'update-profile',
    method: 'PUT',
    path: '/api/user/profile',
    title: 'Update user profile',
    description: 'Update the authenticated user profile information.',
    category: 'User Management',
    protected: true,
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...',
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    requestBody: {
      name: 'John Updated',
      email: 'john.updated@example.com'
    },
    responseExample: {
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: 1,
          name: 'John Updated',
          email: 'john.updated@example.com',
          email_verified_at: null,
          created_at: '2024-01-15T10:30:00.000Z',
          updated_at: '2024-01-15T10:35:00.000Z'
        }
      }
    }
  },
  {
    id: 'users',
    method: 'GET',
    path: '/api/users',
    title: 'Get all users',
    description: 'Get a list of all registered users. Requires authentication.',
    category: 'User Management',
    protected: true,
    headers: {
      'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGc...',
      'Accept': 'application/json'
    },
    responseExample: {
      success: true,
      data: {
        users: [
          {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            email_verified_at: null,
            created_at: '2024-01-15T10:30:00.000Z',
            updated_at: '2024-01-15T10:30:00.000Z'
          }
        ]
      }
    }
  }
];

export const categories = [
  {
    name: 'Authentication',
    icon: 'fas fa-user-shield',
    color: 'text-api-blue'
  },
  {
    name: 'User Management',
    icon: 'fas fa-users',
    color: 'text-api-purple'
  }
];

export const statusCodes = [
  { code: '200', description: 'OK - Request successful', type: 'success' },
  { code: '201', description: 'Created - Resource created successfully', type: 'success' },
  { code: '401', description: 'Unauthorized - Invalid or missing token', type: 'error' },
  { code: '422', description: 'Validation Error - Invalid input data', type: 'error' },
  { code: '500', description: 'Server Error - Internal server error', type: 'error' }
];
