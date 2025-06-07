import { users, type User, type InsertUser, type UpdateUser, type PublicUser } from "@shared/schema";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'password_confirmation'>): Promise<PublicUser>;
  updateUser(id: number, updates: UpdateUser): Promise<PublicUser | undefined>;
  getAllUsers(): Promise<PublicUser[]>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.currentId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: Omit<InsertUser, 'password_confirmation'>): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const id = this.currentId++;
    const now = new Date();
    
    const user: User = {
      id,
      name: insertUser.name,
      email: insertUser.email,
      password: hashedPassword,
      emailVerifiedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    
    this.users.set(id, user);
    
    // Return user without password
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<PublicUser | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser: User = {
      ...user,
      ...updates,
      updatedAt: new Date(),
    };

    this.users.set(id, updatedUser);
    
    // Return user without password
    const { password, ...publicUser } = updatedUser;
    return publicUser;
  }

  async getAllUsers(): Promise<PublicUser[]> {
    return Array.from(this.users.values()).map(({ password, ...user }) => user);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const storage = new MemStorage();
