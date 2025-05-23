import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { fcmTokens, NewFcmToken } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

// Register or update FCM token
export const registerFcmToken = async (req: Request, res: Response) => {
  try {
    const { userId, token, deviceId, platform } = req.body;
    
    // Validate required fields
    if (!userId || !token) {
      return res.status(400).json({ message: 'User ID and token are required' });
    }
    
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
        .set({ token, platform })
        .where(eq(fcmTokens.id, existingToken[0].id));
      
      return res.status(200).json({ 
        message: 'FCM token updated successfully',
        id: existingToken[0].id
      });
    } else {
      // Create new token entry
      const newToken: NewFcmToken = {
        userId,
        token,
        deviceId,
        platform
      };
      
      const result = await db.insert(fcmTokens).values(newToken).returning({ id: fcmTokens.id });
      
      return res.status(201).json({ 
        message: 'FCM token registered successfully',
        id: result[0].id
      });
    }
  } catch (error) {
    console.error('Error registering FCM token:', error);
    return res.status(500).json({ message: 'Error registering FCM token' });
  }
};

// Get all tokens for a user
export const getUserFcmTokens = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const tokens = await db.select({
      id: fcmTokens.id,
      token: fcmTokens.token,
      deviceId: fcmTokens.deviceId,
      platform: fcmTokens.platform,
      createdAt: fcmTokens.createdAt
    })
    .from(fcmTokens)
    .where(eq(fcmTokens.userId, userId));
    
    return res.status(200).json(tokens);
  } catch (error) {
    console.error('Error fetching FCM tokens:', error);
    return res.status(500).json({ message: 'Error fetching FCM tokens' });
  }
};

// Delete a token (for logout or device unregistration)
export const deleteFcmToken = async (req: Request, res: Response) => {
  try {
    const { token, deviceId } = req.body;
    
    if (!token && !deviceId) {
      return res.status(400).json({ message: 'Token or device ID is required' });
    }
    
    let deleteQuery = db.delete(fcmTokens);
    
    if (token) {
      deleteQuery.where(eq(fcmTokens.token, token));
    } else if (deviceId) {
      deleteQuery.where(eq(fcmTokens.deviceId, deviceId));
    }
    
    await deleteQuery;
    
    return res.status(200).json({ message: 'FCM token deleted successfully' });
  } catch (error) {
    console.error('Error deleting FCM token:', error);
    return res.status(500).json({ message: 'Error deleting FCM token' });
  }
};