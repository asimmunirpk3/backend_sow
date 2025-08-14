import express, { Router } from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js'
import session from 'express-session';;
import './utils/config.js'; // import your passport config

const app = express();
dotenv.config();
/* eslint-disable no-undef */

app.use(cors());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));

app.use(session({
  secret: 'yourSecret',
  resave: false,
  saveUninitialized: true,
}));

app.use(routes);
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>SOW API</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #f4f6f8;
          color: #333;
          margin: 0;
          padding: 0;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          height: 100vh;
        }
        .container {
          text-align: center;
          padding: 40px;
          border-radius: 12px;
          background-color: #ffffff;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
        }
        h1 {
          color: #007acc;
          margin-bottom: 10px;
        }
        p {
          font-size: 1.1rem;
          margin: 10px 0;
        }
        a {
          display: inline-block;
          margin-top: 20px;
          text-decoration: none;
          color: #fff;
          background-color: #007acc;
          padding: 10px 24px;
          border-radius: 6px;
          transition: background-color 0.3s ease;
        }
        a:hover {
          background-color: #005fa3;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🚀 Chicago U SERVER </h1>
        <p>The server is up and running smoothly.</p>
        <a href="https://your-frontend-url.com" target="_blank">Open SOW Dashboard</a>
      </div>
    </body>
    </html>
  `);
});

/* eslint-disable no-undef */   
const CONNECTION_URL = process.env.CONNECTION_URL;
const PORT = process.env.PORT || 3333;

// mongodb connection 

mongoose
  .connect(CONNECTION_URL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .then(() =>
    app.listen(PORT, () => console.log(`Server Running on Port: ${PORT}`))
  )
  .catch((error) => console.log(`${error} did not connect`));
