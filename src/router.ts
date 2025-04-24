import express from 'express';
import * as UserController from './controllers/userController.js';
import * as BillController from './controllers/billController.js';

const router = express.Router();

router.get('/test', (req, res) => {
    res.send([
        "test1", "test2", "test3", "test4", "test5", "test6", "test7", "test8", "test9", "test10",
    ]);
    })

// const response =  await fetch('localhost:8080/test')
// String apiURL = 'http://10.0.2.2:8080/test'
// console.log(await response.json())

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

// Bill routes
router.get('/transactions', async (req, res, next) => {
  try {
    await BillController.getTransactions(req, res);
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

export default router;