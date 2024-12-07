const express = require('express');
const bodyParser = require('body-parser');
const scheduleRoutes = require('./routes/scheduleRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/schedule', scheduleRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Server Initialization and api base path defined 

// api endpoints are prefixed with /api/schedule