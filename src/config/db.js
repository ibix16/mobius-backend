const { Pool } = require('pg');
const fs = require('fs');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: true,
    ca: fs.readFileSync('certs/us-west-1-bundle.pem').toString(), // SSL certificate
  },
});

pool.on('connect', () => {
  console.log('Connected to the database');
});

module.exports = pool;
