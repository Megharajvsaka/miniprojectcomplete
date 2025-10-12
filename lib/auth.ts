import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { getDB } from './mongodb';
import { ObjectId } from 'mongodb';
import { initializeUserGamification } from './gamification';

const JWT_SECRET = process.env.JWT_SECRET || '5kFyxgdUg42TG/K6AVdHZer55xUtb+GwJhbBRbR77K0=';

export interface User {
  _id?: ObjectId;
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
  const db = await getDB();
  const usersCollection = db.collection<UserWithPassword>('users');
  
  const hashedPassword = await hashPassword(password);
  const userId = new ObjectId().toString();
  
  const user: UserWithPassword = {
    id: userId,
    email: email.toLowerCase(),
    password: hashedPassword,
    name,
    createdAt: new Date(),
  };
  
  await usersCollection.insertOne(user);
  
  // Initialize gamification profile for new user
  await initializeUserGamification(userId);
  
  // Return user without password
  const { password: _, _id, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const findUserByEmail = async (email: string): Promise<UserWithPassword | null> => {
  const db = await getDB();
  const usersCollection = db.collection<UserWithPassword>('users');
  
  const user = await usersCollection.findOne({ email: email.toLowerCase() });
  return user;
};

export const findUserById = async (id: string): Promise<User | null> => {
  const db = await getDB();
  const usersCollection = db.collection<UserWithPassword>('users');
  
  const user = await usersCollection.findOne({ id });
  if (!user) return null;
  
  const { password: _, _id, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateUserProfile = async (
  id: string, 
  updates: Partial<Pick<User, 'name' | 'age' | 'weight' | 'height' | 'fitnessGoal'>>
): Promise<User | null> => {
  const db = await getDB();
  const usersCollection = db.collection<UserWithPassword>('users');
  
  const result = await usersCollection.findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' }
  );
  
  if (!result) return null;
  
  const { password: _, _id, ...userWithoutPassword } = result;
  return userWithoutPassword;
};