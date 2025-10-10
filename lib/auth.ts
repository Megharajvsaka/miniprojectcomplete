import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { initializeUserGamification } from './gamification';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

export interface User {
  id: string;
  email: string;
  name: string;
  age?: number;
  weight?: number;
  height?: number;
  fitnessGoal?: 'lose_weight' | 'gain_muscle' | 'maintain_fitness';
  createdAt: Date;
}

export interface UserWithPassword extends User {
  password: string;
}

// Mock database - in production, this would be MongoDB
const users: UserWithPassword[] = [];

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

export const comparePasswords = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

export const createUser = async (email: string, password: string, name: string): Promise<User> => {
  const hashedPassword = await hashPassword(password);
  const user: UserWithPassword = {
    id: Date.now().toString(),
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    createdAt: new Date(),
  };
  
  users.push(user);
  
  // Initialize gamification profile for new user
  await initializeUserGamification(user.id);
  
  // Return user without password
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const findUserByEmail = async (email: string): Promise<UserWithPassword | null> => {
  return users.find(user => user.email === email.toLowerCase()) || null;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const user = users.find(user => user.id === id);
  if (!user) return null;
  
  const { password: _, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (
  id: string, 
  updates: Partial<Pick<User, 'name' | 'age' | 'weight' | 'height' | 'fitnessGoal'>>
): Promise<User | null> => {
  const userIndex = users.findIndex(user => user.id === id);
  if (userIndex === -1) return null;
  
  users[userIndex] = { ...users[userIndex], ...updates };
  
  const { password: _, ...userWithoutPassword } = users[userIndex];
  return userWithoutPassword;
};