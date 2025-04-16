import express from 'express';
import * as UserController from './controllers/userController';
import * as BillController from './controllers/billController';

const router = express.Router();

// User routes
router.get('/users', UserController.getUsers);
router.get('/users/:email', UserController.getUserByEmail);
router.post('/users', UserController.createUser);

// Bill routes
router.get('/transactions', BillController.getTransactions);
router.post('/bills', BillController.saveBill);
router.post('/bills/:billId/items', BillController.saveBillItems);
router.post('/bills/:billId/participants', BillController.saveBillParticipants);

export default router;