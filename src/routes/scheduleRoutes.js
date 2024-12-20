const express = require('express');
const { body, param } = require('express-validator');
const { getClasses, createClass, updateClass, deleteClass } = require('../controllers/scheduleController');

const router = express.Router();

// Validation Rules
const classValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('start_time').isISO8601().withMessage('Start time must be a valid ISO 8601 date'),
    body('end_time').isISO8601().withMessage('End time must be a valid ISO 8601 date'),
    body('classroom_id').isInt().withMessage('Classroom ID must be an integer'),
    body('instructor_id').isInt().withMessage('Instructor ID must be an integer')
];

const idValidation = [
    param('id').isInt().withMessage('Class ID must be an integer')
];

// Routes
router.get('/classes', getClasses);
router.post('/classes', classValidationRules, createClass);
router.put('/classes/:id', [...idValidation, ...classValidationRules], updateClass);
router.delete('/classes/:id', idValidation, deleteClass);

module.exports = router;

// This file maps api endpoints to their respective controller functions