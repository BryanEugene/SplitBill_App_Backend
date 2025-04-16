// const express = require('express');
// const pool = require('./db');
// const port = 3000;

// const app = express();
// app.use(express.json());

// // Routes
// app.get('/users', async (req, res) => {
//   try {
//     const users = await pool.query('SELECT * FROM users');
//     res.json(users.rows);
//   } catch (error) {
//     console.error(error.message);
//   }
// });

// app.post('/users', async (req, res) => {
//   try {
//     const { name, email } = req.body;
//     const newUser = await pool.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
//     res.json(newUser.rows[0]);
//   } catch (error) {
//     console.error(error.message);
//   }
// });

import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import cors from 'cors';
import 'dotenv/config';
import router from './router';

const app = express();

app.use(cors({ credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use('/', router);

const server = http.createServer(app);

server.listen(8080, () => {
    console.log('Server running...');
});