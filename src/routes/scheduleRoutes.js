const express = require('express');
const { body, param } = require('express-validator');
const { getClasses, 
        createClass, 
        updateClass, 
        deleteClass, 
        addStudentToClass, 
        getStudents, 
        getStudentById, 
        updateStudent, 
        deleteStudent, 
        editStudentEnrollment, 
        addAvailability, 
        updateAvailability, 
        deleteAvailability, 
        getInstructorAvailabilities } 
        = require('../controllers/scheduleController');

const router = express.Router();

// Validation Rules
const classValidationRules = [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('schedule_day').isString().notEmpty().withMessage('Schedule day is required'),
    body('start_time').isISO8601().withMessage('Start time must be a valid ISO 8601 datetime'),
    body('end_time').isISO8601().withMessage('End time must be a valid ISO 8601 datetime'),
    body('classroom_id').isInt().withMessage('Classroom ID must be an integer'),
    body('instructor_ids').isArray({ min: 1 }).withMessage('At least one instructor ID is required'),
    body('instructor_ids.*').isInt().withMessage('Instructor IDs must be integers')
];

// ID Validation Rule
const idValidation = [
    param('id').isInt().withMessage('Class ID must be an integer')
];

// Routes
router.put('/classes/students', editStudentEnrollment);
router.post('/classes/students', addStudentToClass);
router.get('/classes', getClasses);
router.post('/classes', classValidationRules, createClass);
router.get('/students', getStudents);
router.post("/instructors/availability", addAvailability);
router.put("/instructors/availability", updateAvailability);
router.delete("/instructors/availability", deleteAvailability);
router.put('/classes/:id', [...idValidation, ...classValidationRules], updateClass);
router.delete('/classes/:id', idValidation, deleteClass);
router.get('/students/:id', getStudentById);
router.get('/instructors/availability', getInstructorAvailabilities);
router.put('/students/:id', updateStudent);
router.delete('/students/:id', deleteStudent);





module.exports = router;


// This file maps api endpoints to their respective controller functions