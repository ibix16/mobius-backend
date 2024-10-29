const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Middleware setup
app.use(cors());
app.use(bodyParser.json());

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Möbius MCal Backend!');
});

// Import and use the schedule routes
const scheduleRoutes = require('./routes/schedules');
app.use('/api/schedules', scheduleRoutes);

// Import Sequelize instance and models
const sequelize = require('./config/database');
require('./models/associations'); // Import associations after models are defined

sequelize.authenticate()
  .then(() => console.log('Database connected...'))
  .then(() => {
    sequelize.sync({ force: false }) // Do not drop tables on restart
      .then(() => console.log('Models synchronized with the database.'))
      .catch(err => console.log('Error syncing models:', err));
  })
  .catch(err => console.log('Database connection error:', err));


// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});