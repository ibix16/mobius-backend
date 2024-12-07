const express = require('express');
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/scheduleController');
const router = express.Router();

router.get('/classes', getClasses);
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.delete('/classes/:id', deleteClass);

module.exports = router;

// This file maps api endpoints to their respective controller functions