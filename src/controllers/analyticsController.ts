import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { bills } from '../db/schema.js';
import { sql } from 'drizzle-orm';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Get category totals
    const categoryTotals = await db.select({
      category: bills.category,
      total: sql<number>`sum(${bills.totalAmount})`,
    })
    .from(bills)
    .where(sql`${bills.userId} = ${userId}`)
    .groupBy(bills.category);
    
    // Get monthly spending
    const monthlySpending = await db.select({
      month: sql<string>`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-MM')`,
      amount: sql<number>`sum(${bills.totalAmount})`
    })
    .from(bills)
    .where(sql`${bills.userId} = ${userId}`)
    .groupBy(sql`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-MM')`)
    .orderBy(sql`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-MM')`);
    
    const analytics = {
      categoryTotals,
      monthlySpending
    };
    
    
    return res.status(200).json(analytics);
  } catch (error) {
    console.error('Error generating analytics:', error);
    return res.status(500).json({ message: 'Error generating analytics' });
  }
};