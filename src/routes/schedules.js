const express = require('express');
const router = express.Router();

// Example routes
router.post('/', (req, res) => {
  res.send('Create a new schedule');
});

router.get('/:id', (req, res) => {
  res.send(`Get schedule with ID ${req.params.id}`);
});

module.exports = router;
