import { users, type User, type InsertUser, type UpdateUser, type PublicUser } from "@shared/schema";
import bcrypt from "bcryptjs";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: Omit<InsertUser, 'password_confirmation'>): Promise<PublicUser>;
  updateUser(id: number, updates: UpdateUser): Promise<PublicUser | undefined>;
  getAllUsers(): Promise<PublicUser[]>;
  verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: Omit<InsertUser, 'password_confirmation'>): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    
    const [user] = await db
      .insert(users)
      .values({
        name: insertUser.name,
        email: insertUser.email,
        password: hashedPassword,
      })
      .returning();
    
    // Return user without password
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async updateUser(id: number, updates: UpdateUser): Promise<PublicUser | undefined> {
    const [user] = await db
      .update(users)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    if (!user) return undefined;
    
    // Return user without password
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async getAllUsers(): Promise<PublicUser[]> {
    const allUsers = await db.select().from(users);
    return allUsers.map(({ password, ...user }) => user);
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

export const storage = new DatabaseStorage();
