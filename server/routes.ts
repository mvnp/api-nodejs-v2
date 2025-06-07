import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertUserSchema, loginUserSchema, updateUserSchema } from "@shared/schema";
import jwt from "jsonwebtoken";
import { z } from "zod";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = "1h";

interface AuthRequest extends Request {
  user?: { id: number; email: string };
}

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Node.js JWT Authentication API",
      version: "1.0.0",
      description: "A comprehensive REST API with JWT authentication for user management",
      contact: {
        name: "API Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development server"
      }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Enter JWT token in format: Bearer <token>"
        }
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "integer", example: 1 },
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            emailVerifiedAt: { type: "string", format: "date-time", nullable: true },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" }
          }
        },
        RegisterRequest: {
          type: "object",
          required: ["name", "email", "password", "password_confirmation"],
          properties: {
            name: { type: "string", example: "John Doe" },
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", minLength: 8, example: "password123" },
            password_confirmation: { type: "string", minLength: 8, example: "password123" }
          }
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: { type: "string", format: "email", example: "john@example.com" },
            password: { type: "string", example: "password123" }
          }
        },
        UpdateProfileRequest: {
          type: "object",
          properties: {
            name: { type: "string", example: "John Updated" },
            email: { type: "string", format: "email", example: "john.updated@example.com" }
          }
        },
        AuthResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string", example: "Login successful" },
            data: {
              type: "object",
              properties: {
                user: { $ref: "#/components/schemas/User" },
                token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
                token_type: { type: "string", example: "bearer" },
                expires_in: { type: "integer", example: 3600 }
              }
            }
          }
        },
        ErrorResponse: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Validation failed" },
            errors: {
              type: "object",
              additionalProperties: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    },
    security: []
  },
  apis: ["./server/routes.ts"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// JWT middleware
const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
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
  // Swagger UI
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Node.js JWT API Documentation"
  }));

  // Swagger JSON endpoint
  app.get("/api/swagger.json", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  /**
   * @swagger
   * /api/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/RegisterRequest'
   *     responses:
   *       201:
   *         description: User registered successfully
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.post("/api/register", async (req: Request, res: Response) => {
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

  /**
   * @swagger
   * /api/login:
   *   post:
   *     summary: Authenticate user
   *     tags: [Authentication]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/LoginRequest'
   *     responses:
   *       200:
   *         description: Login successful
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/AuthResponse'
   *       401:
   *         description: Invalid credentials
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.post("/api/login", async (req: Request, res: Response) => {
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

  /**
   * @swagger
   * /api/refresh:
   *   post:
   *     summary: Refresh JWT token
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Token refreshed successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Token refreshed successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     token:
   *                       type: string
   *                       example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
   *                     token_type:
   *                       type: string
   *                       example: "bearer"
   *                     expires_in:
   *                       type: integer
   *                       example: 3600
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.post("/api/refresh", authenticateToken, async (req: AuthRequest, res: Response) => {
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

  /**
   * @swagger
   * /api/logout:
   *   post:
   *     summary: Logout user
   *     tags: [Authentication]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Successfully logged out
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Successfully logged out"
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.post("/api/logout", authenticateToken, (req: Request, res: Response) => {
    res.json({
      success: true,
      message: "Successfully logged out"
    });
  });

  /**
   * @swagger
   * /api/user/profile:
   *   get:
   *     summary: Get user profile
   *     tags: [User Management]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Profile retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.get("/api/user/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
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

  /**
   * @swagger
   * /api/user/profile:
   *   put:
   *     summary: Update user profile
   *     tags: [User Management]
   *     security:
   *       - BearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateProfileRequest'
   *     responses:
   *       200:
   *         description: Profile updated successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 message:
   *                   type: string
   *                   example: "Profile updated successfully"
   *                 data:
   *                   type: object
   *                   properties:
   *                     user:
   *                       $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   *       422:
   *         description: Validation error
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.put("/api/user/profile", authenticateToken, async (req: AuthRequest, res: Response) => {
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

  /**
   * @swagger
   * /api/users:
   *   get:
   *     summary: Get all users
   *     tags: [User Management]
   *     security:
   *       - BearerAuth: []
   *     responses:
   *       200:
   *         description: Users retrieved successfully
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: true
   *                 data:
   *                   type: object
   *                   properties:
   *                     users:
   *                       type: array
   *                       items:
   *                         $ref: '#/components/schemas/User'
   *       401:
   *         description: Unauthorized
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/ErrorResponse'
   */
  app.get("/api/users", authenticateToken, async (req: AuthRequest, res: Response) => {
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