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

// Update user (name and phone number only)
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phoneNumber } = req.body;

    console.log('Update user request:', { id, name, phoneNumber });
    
    // Validate user ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }
    
    // Validate at least one field to update
    if (!name && !phoneNumber) {
      return res.status(400).json({ message: 'At least one field (name or phoneNumber) is required to update' });
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, Number(id)));
    
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Prepare update data
    const updateData: Partial<NewUser> = {};
    if (name) updateData.name = name;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    
    // Update user
    const result = await db.update(users)
      .set(updateData)
      .where(eq(users.id, Number(id)))
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
        phoneNumber: users.phoneNumber
      });
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: result[0]
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Error updating user' });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Validate user ID
    if (!id || isNaN(Number(id))) {
      return res.status(400).json({ message: 'Valid user ID is required' });
    }
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.id, Number(id)));
    
    if (existingUser.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user (cascade will handle related records)
    await db.delete(users).where(eq(users.id, Number(id)));
    
    return res.status(200).json({
      message: 'User deleted successfully',
      deletedUser: {
        id: existingUser[0].id,
        name: existingUser[0].name,
        email: existingUser[0].email
      }
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Error deleting user' });
  }
};