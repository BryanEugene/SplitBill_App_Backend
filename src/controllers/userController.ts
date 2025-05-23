import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { users, NewUser, fcmTokens, NewFcmToken } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Get all users
export const getUsers = async (_req: Request, res: Response) => {
  try {
    const allUsers = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber
    }).from(users);
    
    return res.status(200).json(allUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Error fetching users' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password, fcmToken, deviceId, platform } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    
    // Check if user exists
    const user = await db.select().from(users).where(eq(users.email, email));
    
    if (user.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check password (in a real app, this should be hashed)
    if (user[0].password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Handle FCM token if provided
    if (fcmToken) {
      const userId = user[0].id;
      
      // Check if token already exists for this device
      const existingToken = deviceId 
        ? await db.select().from(fcmTokens).where(
            and(
              eq(fcmTokens.userId, userId),
              eq(fcmTokens.deviceId, deviceId)
            )
          )
        : [];
      
      if (existingToken.length > 0) {
        // Update existing token
        await db.update(fcmTokens)
          .set({ token: fcmToken, platform })
          .where(eq(fcmTokens.id, existingToken[0].id));
      } else {
        // Create new token entry
        const newToken: NewFcmToken = {
          userId,
          token: fcmToken,
          deviceId,
          platform
        };
        
        await db.insert(fcmTokens).values(newToken);
      }
    }
    
    return res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({ message: 'Error logging in' });
  }
}

// Get user by email
export const getUserByEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    
    const user = await db.select().from(users).where(eq(users.email, email));
    
    if (user.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user[0]);
  } catch (error) {
    console.error('Error fetching user by email:', error);
    return res.status(500).json({ message: 'Error fetching user' });
  }
};

// Create user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    
    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email));
    
    if (existingUser.length > 0) {
      return res.status(409).json({ message: 'User with this email already exists' });
    }
    
    const newUser: NewUser = {
      name,
      email,
      password, // In a real app, this should be hashed
      phoneNumber,
    };
    
    const result = await db.insert(users).values(newUser).returning({
      id: users.id,
      name: users.name,
      email: users.email,
      phoneNumber: users.phoneNumber
    });
    
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Error creating user' });
  }
};