import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { paymentMethods, NewPaymentMethod, users } from '../db/schema.js';
import { eq } from 'drizzle-orm';

// Get all payment methods for a user
export const getPaymentMethods = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    const userPaymentMethods = await db.select({
      id: paymentMethods.id,
      methodName: paymentMethods.methodName,
      accountNumber: paymentMethods.accountNumber,
      userName: users.name,
    })
    .from(paymentMethods)
    .leftJoin(users, eq(paymentMethods.userId, users.id))
    .where(eq(paymentMethods.userId, userId));
    
    return res.status(200).json(userPaymentMethods);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    return res.status(500).json({ message: 'Error fetching payment methods' });
  }
};

// Get payment method by ID
export const getPaymentMethodById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const methodId = parseInt(id);
    
    if (isNaN(methodId)) {
      return res.status(400).json({ message: 'Invalid payment method ID' });
    }
    
    const method = await db.select({
      id: paymentMethods.id,
      userId: paymentMethods.userId,
      methodName: paymentMethods.methodName,
      accountNumber: paymentMethods.accountNumber,
      userName: users.name,
    })
    .from(paymentMethods)
    .leftJoin(users, eq(paymentMethods.userId, users.id))
    .where(eq(paymentMethods.id, methodId));
    
    if (method.length === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    return res.status(200).json(method[0]);
  } catch (error) {
    console.error('Error fetching payment method:', error);
    return res.status(500).json({ message: 'Error fetching payment method' });
  }
};

// Create a new payment method
export const createPaymentMethod = async (req: Request, res: Response) => {
  try {
    const { userId, methodName, accountNumber } = req.body;
    
    // Validate required fields
    if (!userId || !methodName || !accountNumber) {
      return res.status(400).json({ 
        message: 'User ID, method name, and account number are required' 
      });
    }
    
    // Create the new payment method
    const newPaymentMethod: NewPaymentMethod = {
      userId,
      methodName,
      accountNumber,
    };
    
    const insertedMethod = await db.insert(paymentMethods).values(newPaymentMethod).returning({
      id: paymentMethods.id,
      methodName: paymentMethods.methodName,
      accountNumber: paymentMethods.accountNumber,
    });
    
    // Get the user name to include in the response
    const user = await db.select({
      name: users.name
    })
    .from(users)
    .where(eq(users.id, userId));
    
    return res.status(201).json({
      ...insertedMethod[0],
      userName: user[0]?.name
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return res.status(500).json({ message: 'Error creating payment method' });
  }
};

// Update a payment method
export const updatePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const methodId = parseInt(id);
    const { methodName, accountNumber } = req.body;
    
    if (isNaN(methodId)) {
      return res.status(400).json({ message: 'Invalid payment method ID' });
    }
    
    // Check if payment method exists
    const existingMethod = await db.select().from(paymentMethods).where(eq(paymentMethods.id, methodId));
    
    if (existingMethod.length === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Update the payment method
    await db.update(paymentMethods)
      .set({
        methodName: methodName || existingMethod[0].methodName,
        accountNumber: accountNumber || existingMethod[0].accountNumber,
      })
      .where(eq(paymentMethods.id, methodId));
    
    // Get the updated payment method
    const updatedMethod = await db.select({
      id: paymentMethods.id,
      userId: paymentMethods.userId,
      methodName: paymentMethods.methodName,
      accountNumber: paymentMethods.accountNumber,
      userName: users.name,
    })
    .from(paymentMethods)
    .leftJoin(users, eq(paymentMethods.userId, users.id))
    .where(eq(paymentMethods.id, methodId));
    
    return res.status(200).json(updatedMethod[0]);
  } catch (error) {
    console.error('Error updating payment method:', error);
    return res.status(500).json({ message: 'Error updating payment method' });
  }
};

// Delete a payment method
export const deletePaymentMethod = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const methodId = parseInt(id);
    
    if (isNaN(methodId)) {
      return res.status(400).json({ message: 'Invalid payment method ID' });
    }
    
    // Check if payment method exists
    const existingMethod = await db.select().from(paymentMethods).where(eq(paymentMethods.id, methodId));
    
    if (existingMethod.length === 0) {
      return res.status(404).json({ message: 'Payment method not found' });
    }
    
    // Delete the payment method
    await db.delete(paymentMethods).where(eq(paymentMethods.id, methodId));
    
    return res.status(200).json({ message: 'Payment method deleted successfully' });
  } catch (error) {
    console.error('Error deleting payment method:', error);
    return res.status(500).json({ message: 'Error deleting payment method' });
  }
};