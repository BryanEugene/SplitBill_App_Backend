import express from 'express';
import * as UserController from './controllers/userController.js';
import * as BillController from './controllers/billController.js';
import * as FriendController from './controllers/friendController.js';
import * as AnalyticsController from './controllers/analyticsController.js';
import * as ReceiptController from './controllers/receiptController.js';
import * as PaymentMethodController from './controllers/paymentMethodController.js';
import * as FcmTokenController from './controllers/fcmTokenController.js';
import multer from 'multer';

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

const router = express.Router();

// Test endpoint
router.get('/test', (req, res) => {
    res.send([
        "test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10",
    ]);
});

// User routes
router.get('/users', async (req, res, next) => {
  try {
    await UserController.getUsers(req, res);
  } catch (error) {
    console.log('Error in router:', error);
    next(error);
  }
});

router.get('/users/:email', async (req, res, next) => {
  try {
    await UserController.getUserByEmail(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/users', async (req, res, next) => {
  try {
    await UserController.createUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/users/:id', async (req, res, next) => {
  try {
    await UserController.updateUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/users/:id', async (req, res, next) => {
  try {
    await UserController.deleteUser(req, res);
  } catch (error) {
    next(error);
  }
});

// Authentication routes
router.post('/login', async (req, res, next) => {
  try {
    await UserController.login(req, res);
  } catch (error) {
    next(error);
  }
});

// Bill routes
router.get('/bills', async (req, res, next) => {
  try {
    await BillController.getTransactions(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/bills/:id', async (req, res, next) => {
  try {
    await BillController.getBillDetails(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/bills', async (req, res, next) => {
  try {
    await BillController.saveBill(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/bills/:billId/payment', async (req, res, next) => {
  try {
    await BillController.updatePaymentStatus(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/bills/:billId/items', async (req, res, next) => {
  try {
    await BillController.saveBillItems(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/bills/:billId/participants', async (req, res, next) => {
  try {
    await BillController.saveBillParticipants(req, res);
  } catch (error) {
    next(error);
  }
});

// Transaction endpoints (legacy routes)
router.get('/transactions', async (req, res, next) => {
  try {
    await BillController.getTransactions(req, res);
  } catch (error) {
    next(error);
  }
});

// Friend routes
router.get('/friends', async (req, res, next) => {
  try {
    await FriendController.getFriends(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/friends', async (req, res, next) => {
  try {
    await FriendController.addFriend(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/friends/:friendId', async (req, res, next) => {
  try {
    await FriendController.deleteFriend(req, res);
  } catch (error) {
    next(error);
  }
});

// Analytics routes
router.get('/analytics', async (req, res, next) => {
  try {
    await AnalyticsController.getAnalytics(req, res);
  } catch (error) {
    next(error);
  }
});

// Receipt processing route
router.post('/receipts/scan', upload.single('receipt'), async (req, res, next) => {
  try {
    await ReceiptController.processReceipt(req, res);
  } catch (error) {
    next(error);
  }
});

// Payment Method routes
router.get('/paymentMethods', async (req, res, next) => {
  try {
    await PaymentMethodController.getPaymentMethods(req, res);
  } catch (error) {
    next(error);
  }
});

router.get('/paymentMethods/:id', async (req, res, next) => {
  try {
    await PaymentMethodController.getPaymentMethodById(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/paymentMethods', async (req, res, next) => {
  try {
    await PaymentMethodController.createPaymentMethod(req, res);
  } catch (error) {
    next(error);
  }
});

router.put('/paymentMethods/:id', async (req, res, next) => {
  try {
    await PaymentMethodController.updatePaymentMethod(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/paymentMethods/:id', async (req, res, next) => {
  try {
    await PaymentMethodController.deletePaymentMethod(req, res);
  } catch (error) {
    next(error);
  }
});

// FCM Token routes
router.get('/fcmTokens', async (req, res, next) => {
  try {
    await FcmTokenController.getUserFcmTokens(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/fcmTokens', async (req, res, next) => {
  try {
    await FcmTokenController.registerFcmToken(req, res);
  } catch (error) {
    next(error);
  }
});

router.delete('/fcmTokens', async (req, res, next) => {
  try {
    await FcmTokenController.deleteFcmToken(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;