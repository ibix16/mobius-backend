const express = require('express');
const bodyParser = require('body-parser');
const scheduleRoutes = require('./src/routes/scheduleRoutes');

require('dotenv').config();

const app = express();
app.use(bodyParser.json());

app.use('/api/schedule', scheduleRoutes);

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.url}`);
  next();
});


app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.url} not found` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});