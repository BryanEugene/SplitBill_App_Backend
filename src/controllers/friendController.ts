import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { friends, NewFriend } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get friends for a user
export const getFriends = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const userFriends = await db.select({
      id: friends.id,
      name: friends.friendName,
      email: friends.email,
      phoneNumber: friends.phoneNumber
    })
    .from(friends)
    .where(eq(friends.userId, userId));
    
    return res.status(200).json(userFriends);
  } catch (error) {
    console.error('Error fetching friends:', error);
    return res.status(500).json({ message: 'Error fetching friends' });
  }
};

// Add a friend
export const addFriend = async (req: Request, res: Response) => {
  try {
    const { userId, name, email, phoneNumber } = req.body;
    
    // Validate required fields
    if (!userId || !name) {
      return res.status(400).json({ message: 'User ID and friend name are required' });
    }
    
    const newFriend: NewFriend = {
      userId,
      friendName: name,
      email,
      phoneNumber
    };
    
    const result = await db.insert(friends).values(newFriend).returning({
      id: friends.id,
      name: friends.friendName,
      email: friends.email,
      phoneNumber: friends.phoneNumber
    });
    
    return res.status(201).json(result[0]);
  } catch (error) {
    console.error('Error adding friend:', error);
    return res.status(500).json({ message: 'Error adding friend' });
  }
};