import { Request, Response } from 'express';
import { db } from '../db/index.js';
import { bills } from '../db/schema.js';
import { sql } from 'drizzle-orm';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const userId = Number(req.query.userId) || 0;
    const activeFilter = req.query.activeFilter as string || 'month'; // default to month

    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    
    // Validate activeFilter parameter
    if (!['week', 'month', 'year'].includes(activeFilter)) {
      return res.status(400).json({ message: 'activeFilter must be one of: week, month, year' });
    }
    
    console.log('User ID:', userId);
    console.log('Active Filter:', activeFilter);    try {
      // Define date filter condition based on activeFilter
      let dateCondition;
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      switch (activeFilter) {
        case 'week':
          // Last 7 days
          dateCondition = sql`to_date(${bills.date}, 'YYYY-MM-DD') >= current_date - interval '7 days'`;
          break;
        case 'month':
          // Last 1 month
          dateCondition = sql`to_date(${bills.date}, 'YYYY-MM-DD') >= current_date - interval '1 month'`;
          break;
        case 'year':
          // Last 1 year
          dateCondition = sql`to_date(${bills.date}, 'YYYY-MM-DD') >= current_date - interval '1 year'`;
          break;
        default:
          dateCondition = sql`true`; // No filter
      }

      // Get category totals with date filter
      const categoryTotals = await db.select({
        category: bills.category,
        total: sql<number>`sum(${bills.totalAmount})`,
      })
      .from(bills)
      .where(sql`${bills.userId} = ${userId} AND ${dateCondition}`)
      .groupBy(bills.category);
      
      // Get monthly spending with date filter
      let timeGrouping;
      let timeFormat;
      
      if (activeFilter === 'week') {
        // Group by day for week view
        timeGrouping = sql`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-MM-DD')`;
        timeFormat = 'day';
      } else if (activeFilter === 'month') {
        // Group by week for month view
        timeGrouping = sql`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-"W"WW')`;
        timeFormat = 'week';
      } else {
        // Group by month for year view
        timeGrouping = sql`to_char(to_date(${bills.date}, 'YYYY-MM-DD'), 'YYYY-MM')`;
        timeFormat = 'month';
      }
      
      const timeBasedSpending = await db.select({
        period: timeGrouping,
        amount: sql<number>`sum(${bills.totalAmount})`
      })
      .from(bills)
      .where(sql`${bills.userId} = ${userId} AND ${dateCondition}`)
      .groupBy(timeGrouping)
      .orderBy(timeGrouping);
      
      const analytics = {
        categoryTotals,
        timeBasedSpending,
        timeFormat,
        activeFilter
      };
      
      
      return res.status(200).json(analytics);
      
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return res.status(500).json({ message: 'Error fetching analytics' });
    }
    
  } catch (error) {
    console.error('Error generating analytics:', error);
    return res.status(500).json({ message: 'Error generating analytics' });
  }
};