# SplitBill API Backend

This is the API backend for the SplitBill application, a full-featured expense sharing app that helps users track and split bills with friends.

## Tech Stack

- **Node.js/Express**: Fast, lightweight web framework
- **TypeScript**: Type-safe JavaScript
- **PostgreSQL**: Relational database for data storage
- **Drizzle ORM**: Modern TypeScript ORM
- **Firebase**: For cloud messaging and notifications
- **Multer**: For file upload handling (receipt scanning)

## Features

- User management and authentication
- Bill creation and expense splitting
- Friend management
- Bill payment tracking
- FCM token management for push notifications
- Payment method management
- Receipt scanning and processing
- Analytics for expense tracking

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a PostgreSQL database (manually or using Docker):
```bash
# Using Docker
docker compose -f compose.yaml up -d
```

3. Create a `.env` file with database connection string:
```
DB=postgres://username:password@localhost:5432/splitbill
PORT=8080
```

4. Set up Firebase configuration:
   - The project includes a Firebase configuration file for cloud messaging
   - Ensure the Firebase credentials in `firebaseConfig.ts` are valid

5. Run database migrations:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

7. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Users

- `GET /users` - Get all users
- `GET /users/:email` - Get user by email
- `POST /users` - Create a new user
- `PUT /users/:id` - Update user (name and phone number only)
- `DELETE /users/:id` - Delete user account
- `POST /login` - User login endpoint (accepts FCM token for notifications)

### Bills

- `GET /bills` - Get all transactions
- `GET /bills/:id` - Get bill details by ID
- `POST /bills` - Create a new bill with items and participants
- `POST /bills/:billId/payment` - Update payment status
- `POST /bills/:billId/items` - Add items to an existing bill
- `POST /bills/:billId/participants` - Add participants to an existing bill

### Friends

- `GET /friends` - Get all friends for a user
- `POST /friends` - Add a new friend

### Payment Methods

- `GET /paymentMethods` - Get all payment methods for a user
- `GET /paymentMethods/:id` - Get payment method by ID
- `POST /paymentMethods` - Create a new payment method
- `PUT /paymentMethods/:id` - Update a payment method
- `DELETE /paymentMethods/:id` - Delete a payment method

### Analytics

- `GET /analytics?userId=<userId>&activeFilter=<filter>` - Get expense analytics data
  - **userId** (required): User ID to get analytics for
  - **activeFilter** (optional): Time period filter
    - `week` - Last 7 days (grouped by day)
    - `month` - Last 1 month (grouped by week) 
    - `year` - Last 1 year (grouped by month)
    - Default: `month`

### FCM Token Management

- `GET /fcmTokens` - Get user's FCM tokens
- `POST /fcmTokens` - Register a new FCM token
- `DELETE /fcmTokens` - Delete an FCM token

### Receipt Processing

- `POST /receipts/scan` - Upload and process a receipt image

## Data Structure

The API is designed to work with the following data structures:

### Bill Data
```typescript
interface BillData {
  userId: number;
  title: string;
  category: string;
  totalAmount: number;
  date: string;
  items: BillItemData[];
  participants: BillParticipantData[];
}

interface BillItemData {
  itemName: string;
  price: number;
}

interface BillParticipantData {
  participantId: number;
  amount: number;
  isPaid?: boolean;
}
```

### Transaction Data (Response format for GET /transactions)
```typescript
interface TransactionData {
  id: number;
  title: string;
  amount: number;
  date: string;
  participants: number;
  category: string;
}
```

### User Update Data
```typescript
interface UserUpdateData {
  name?: string;        // Optional: new name
  phoneNumber?: string; // Optional: new phone number
}

// Response format for user update/delete
interface UserResponse {
  message: string;
  user?: {
    id: number;
    name: string;
    email: string;
    phoneNumber: string;
  };
  deletedUser?: {
    id: number;
    name: string;
    email: string;
  };
}
```

### FCM Token Registration
```typescript
interface FcmTokenData {
  userId: number;
  token: string;
  deviceId?: string;
  platform?: string; // 'android', 'ios', 'web'
}
```

### Analytics Response
```typescript
interface AnalyticsData {
  categoryTotals: {
    category: string;
    total: number;
  }[];
  timeBasedSpending: {
    period: string; // Format depends on activeFilter
    amount: number;
  }[];
  timeFormat: 'day' | 'week' | 'month'; // Indicates grouping format
  activeFilter: 'week' | 'month' | 'year';
}
```
```

## Development

- **Database Migrations**: Use `npm run db:generate` to create migration files
- **Server Reload**: Nodemon automatically reloads on file changes during development
- **File Uploads**: Receipts are uploaded to the `uploads/` directory#   S p l i t B i l l _ A p p _ B a c k e n d 
 
 