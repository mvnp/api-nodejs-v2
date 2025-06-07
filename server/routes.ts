import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, updateUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "1h";

interface AuthRequest extends Express.Request {
  user?: { id: number; email: string };
}

// JWT middleware
const authenticateToken = async (req: AuthRequest, res: Express.Response, next: Express.NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token required",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: number; email: string };
    const user = await storage.getUser(decoded.id);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = { id: user.id, email: user.email };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Swagger/OpenAPI documentation endpoint
  app.get("/api/docs", (req, res) => {
    const swaggerDoc = {
      openapi: "3.0.0",
      info: {
        title: "Laravel-style JWT Authentication API",
        version: "1.0.0",
        description: "RESTful API with JWT token-based authentication system for secure user management and protected routes."
      },
      servers: [
        {
          url: "https://api.example.com",
          description: "Production server"
        }
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT"
          }
        }
      },
      paths: {
        "/api/register": {
          post: {
            summary: "Register a new user",
            tags: ["Authentication"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      name: { type: "string" },
                      email: { type: "string", format: "email" },
                      password: { type: "string", minLength: 8 },
                      password_confirmation: { type: "string", minLength: 8 }
                    },
                    required: ["name", "email", "password", "password_confirmation"]
                  }
                }
              }
            },
            responses: {
              201: {
                description: "User registered successfully"
              },
              422: {
                description: "Validation error"
              }
            }
          }
        },
        "/api/login": {
          post: {
            summary: "Authenticate user",
            tags: ["Authentication"],
            requestBody: {
              required: true,
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      email: { type: "string", format: "email" },
                      password: { type: "string" }
                    },
                    required: ["email", "password"]
                  }
                }
              }
            },
            responses: {
              200: {
                description: "Login successful"
              },
              401: {
                description: "Invalid credentials"
              }
            }
          }
        },
        "/api/user/profile": {
          get: {
            summary: "Get user profile",
            tags: ["User Management"],
            security: [{ bearerAuth: [] }],
            responses: {
              200: {
                description: "Profile retrieved successfully"
              },
              401: {
                description: "Unauthorized"
              }
            }
          }
        }
      }
    };
    
    res.json(swaggerDoc);
  });

  // Auth routes
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors: {
            email: ["A user with this email already exists."]
          }
        });
      }

      // Create user
      const { password_confirmation, ...userData } = validatedData;
      const user = await storage.createUser(userData);

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user,
          token,
          token_type: "bearer",
          expires_in: 3600
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });

        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.post("/api/login", async (req, res) => {
    try {
      const validatedData = loginUserSchema.parse(req.body);
      
      // Find user
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
          errors: {
            email: ["The provided credentials are incorrect."]
          }
        });
      }

      // Verify password
      const isValidPassword = await storage.verifyPassword(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: "Invalid credentials",
          errors: {
            email: ["The provided credentials are incorrect."]
          }
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      // Return user without password
      const { password, ...publicUser } = user;

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: publicUser,
          token,
          token_type: "bearer",
          expires_in: 3600
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });

        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.post("/api/refresh", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }

      // Generate new JWT token
      const token = jwt.sign(
        { id: req.user.id, email: req.user.email },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRES_IN }
      );

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token,
          token_type: "bearer",
          expires_in: 3600
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.post("/api/logout", authenticateToken, (req, res) => {
    // In a real application, you might want to invalidate the token
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: "Successfully logged out"
    });
  });

  // Protected routes
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      // Return user without password
      const { password, ...publicUser } = user;

      res.json({
        success: true,
        data: {
          user: publicUser
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.put("/api/user/profile", authenticateToken, async (req: AuthRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }

      const validatedData = updateUserSchema.parse(req.body);
      
      // Check if email is being changed and if it already exists
      if (validatedData.email) {
        const existingUser = await storage.getUserByEmail(validatedData.email);
        if (existingUser && existingUser.id !== req.user.id) {
          return res.status(422).json({
            success: false,
            message: "Validation failed",
            errors: {
              email: ["A user with this email already exists."]
            }
          });
        }
      }

      const updatedUser = await storage.updateUser(req.user.id, validatedData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: "User not found"
        });
      }

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors: Record<string, string[]> = {};
        error.errors.forEach((err) => {
          const field = err.path.join('.');
          if (!errors[field]) errors[field] = [];
          errors[field].push(err.message);
        });

        return res.status(422).json({
          success: false,
          message: "Validation failed",
          errors
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  app.get("/api/users", authenticateToken, async (req: AuthRequest, res) => {
    try {
      const users = await storage.getAllUsers();
      
      res.json({
        success: true,
        data: {
          users
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Internal server error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
