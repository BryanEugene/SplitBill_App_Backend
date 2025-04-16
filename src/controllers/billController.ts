import { Request, Response } from 'express';
import { db } from '../db';
import { bills, billItems, billParticipants, NewBill, NewBillItem, NewBillParticipant } from '../db/schema';
import { eq, sql, count } from 'drizzle-orm';

// Types to match the React context
interface BillItemData {
  itemName: string;
  price: number;
}

interface BillParticipantData {
  participantId: number;
  amount: number;
  isPaid?: boolean;
}

interface BillData {
  userId: number;
  title: string;
  category: string;
  totalAmount: number;
  date: string;
  items: BillItemData[];
  participants: BillParticipantData[];
}

// Get transactions/bills with optional category filter
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = db
      .select({
        id: bills.id,
        title: bills.title,
        amount: bills.totalAmount,
        date: bills.date,
        category: bills.category,
        participants: count(billParticipants.participantId).as('participants')
      })
      .from(bills)
      .leftJoin(billParticipants, eq(bills.id, billParticipants.billId))
      .groupBy(bills.id);
    
    // Apply category filter if provided
    if (category && category !== 'all') {
      query = query.where(eq(bills.category, category as string));
    }
    
    // Order by date descending
    query = query.orderBy(sql`${bills.date} DESC`);
    
    const transactions = await query;
    
    return res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ message: 'Error fetching transactions' });
  }
};

// Save a bill with its items and participants
export const saveBill = async (req: Request, res: Response) => {
  try {
    const billData: BillData = req.body;
    
    // Validate required fields
    if (!billData.userId || !billData.title || !billData.category || 
        !billData.totalAmount || !billData.date) {
      return res.status(400).json({ 
        message: 'All fields (userId, title, category, totalAmount, date) are required' 
      });
    }

    // Start a transaction
    const result = await db.transaction(async (tx) => {
      // Insert the bill record
      const newBill: NewBill = {
        userId: billData.userId,
        title: billData.title,
        category: billData.category,
        totalAmount: billData.totalAmount,
        date: billData.date
      };
      
      const insertedBill = await tx.insert(bills).values(newBill).returning({ id: bills.id });
      const billId = insertedBill[0].id;
      
      // Save bill items
      if (billData.items && billData.items.length > 0) {
        const billItemsToInsert: NewBillItem[] = billData.items.map((item) => ({
          billId,
          itemName: item.itemName,
          price: item.price,
        }));
        
        await tx.insert(billItems).values(billItemsToInsert);
      }
      
      // Save bill participants
      if (billData.participants && billData.participants.length > 0) {
        const participantsToInsert: NewBillParticipant[] = billData.participants.map((participant) => ({
          billId,
          participantId: participant.participantId,
          amount: participant.amount,
          isPaid: participant.isPaid || false,
        }));
        
        await tx.insert(billParticipants).values(participantsToInsert);
      }
      
      return billId;
    });
    
    return res.status(201).json({ id: result });
  } catch (error) {
    console.error('Error saving bill:', error);
    return res.status(500).json({ message: 'Error saving bill' });
  }
};

// Save bill items for an existing bill
export const saveBillItems = async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    const items: BillItemData[] = req.body;
    
    // Validate parameters
    if (!billId || !items || items.length === 0) {
      return res.status(400).json({ message: 'Bill ID and items are required' });
    }
    
    // Check if bill exists
    const billExists = await db.select().from(bills).where(eq(bills.id, parseInt(billId)));
    if (billExists.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Insert bill items
    const billItemsToInsert: NewBillItem[] = items.map((item) => ({
      billId: parseInt(billId),
      itemName: item.itemName,
      price: item.price,
    }));
    
    await db.insert(billItems).values(billItemsToInsert);
    
    return res.status(201).json({ message: 'Bill items saved successfully' });
  } catch (error) {
    console.error('Error saving bill items:', error);
    return res.status(500).json({ message: 'Error saving bill items' });
  }
};

// Save bill participants for an existing bill
export const saveBillParticipants = async (req: Request, res: Response) => {
  try {
    const { billId } = req.params;
    const participants: BillParticipantData[] = req.body;
    
    // Validate parameters
    if (!billId || !participants || participants.length === 0) {
      return res.status(400).json({ message: 'Bill ID and participants are required' });
    }
    
    // Check if bill exists
    const billExists = await db.select().from(bills).where(eq(bills.id, parseInt(billId)));
    if (billExists.length === 0) {
      return res.status(404).json({ message: 'Bill not found' });
    }
    
    // Insert bill participants
    const participantsToInsert: NewBillParticipant[] = participants.map((participant) => ({
      billId: parseInt(billId),
      participantId: participant.participantId,
      amount: participant.amount,
      isPaid: participant.isPaid || false,
    }));
    
    await db.insert(billParticipants).values(participantsToInsert);
    
    return res.status(201).json({ message: 'Bill participants saved successfully' });
  } catch (error) {
    console.error('Error saving bill participants:', error);
    return res.status(500).json({ message: 'Error saving bill participants' });
  }
};