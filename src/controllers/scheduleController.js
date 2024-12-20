const { validationResult } = require('express-validator');
const pool = require('../config/db');
const {
    checkClassroomConflict,
    checkInstructorConflict
} = require('../helpers/conflictCheck'); 

// Get all classes
const getClasses = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classes');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database query failed:', error);  // Log the full error
        res.status(500).json({ error: 'Failed to retrieve classes' });
    }
};

// Create a new class
const createClass = async (req, res) => {
    // Validation check
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, start_time, end_time, schedule_day, classroom_id, instructor_ids } = req.body;

    try {
        // Check for Classroom Conflicts
        if (await checkClassroomConflict(classroom_id, start_time, end_time, schedule_day)) {
            return res.status(400).json({ error: "Classroom conflict detected" });
        }

        // Check for Instructor Conflicts
        if (await checkInstructorConflict(instructor_ids, start_time, end_time, schedule_day)) {
            return res.status(400).json({
                error: "Instructor conflict detected",
                instructors: instructor_ids
            });
        }

        // Create the Class
        const result = await pool.query(`
            INSERT INTO classes (title, description, start_time, end_time, schedule_day, classroom_id) 
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING id
        `, [title, description, start_time, end_time, schedule_day, classroom_id]);

        const class_id = result.rows[0].id;

        // Assign Instructors
        await pool.query(`
            INSERT INTO class_instructors (class_id, instructor_id) 
            SELECT $1, unnest($2::int[])
        `, [class_id, instructor_ids]);

        res.status(201).json({ message: "Class created successfully!" });
    } catch (error) {
        console.error('Database insertion failed:', error);
        res.status(500).json({ error: "Failed to create class" });
    }
};

// Update a class
const updateClass = async (req, res) => {
    const { id } = req.params;
    const { title, description, start_time, end_time, schedule_day, classroom_id, instructor_ids } = req.body;

    try {
        // Check if Class Exists
        const classCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [id]);
        if (classCheck.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Check for Classroom Conflicts (Exclude Current Class)
        if (await checkClassroomConflict(classroom_id, start_time, end_time, schedule_day, id)) {
            return res.status(400).json({ error: "Classroom conflict detected" });
        }

        // Check for Instructor Conflicts (Exclude Current Class)
        if (await checkInstructorConflict(instructor_ids, start_time, end_time, schedule_day, id)) {
            return res.status(400).json({
                error: "Instructor conflict detected",
                instructors: instructor_ids
            });
        }

        // Update the Class
        const result = await pool.query(`
            UPDATE classes 
            SET title = $1, description = $2, start_time = $3, end_time = $4, 
                schedule_day = $5, classroom_id = $6 
            WHERE id = $7 
            RETURNING *;
        `, [title, description, start_time, end_time, schedule_day, classroom_id, id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        // Update Instructors
        await pool.query(`DELETE FROM class_instructors WHERE class_id = $1`, [id]);
        await pool.query(`
            INSERT INTO class_instructors (class_id, instructor_id) 
            SELECT $1, unnest($2::int[])
        `, [id, instructor_ids]);

        res.status(200).json({ message: "Class updated successfully!" });
    } catch (error) {
        console.error('Database update failed:', error);
        res.status(500).json({ error: "Failed to update class" });
    }
};

// Delete a class
const deleteClass = async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM classes WHERE id = $1 RETURNING *`, [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Class not found" });
        }

        res.status(200).json({ message: "Class deleted successfully!" });
    } catch (error) {
        console.error('Database deletion failed:', error);
        res.status(500).json({ error: "Failed to delete class" });
    }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };

// Controller logic found above includes:
//  - Getting all classes in db
//  - Creating new class
//  - Updating existing class
//  - Deleting class

// This file contains the logic for handling requests to each route
