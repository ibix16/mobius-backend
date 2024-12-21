const { validationResult } = require('express-validator');
const pool = require('../config/db');
const {
    checkClassroomConflict,
    checkInstructorConflict,
    checkStudentConflict
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

// Add a student to a class
const addStudentToClass = async (req, res) => {
    const { class_id, student_id } = req.body;
  
    try {
      // Check if the Class Exists
      const classCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [class_id]);
      if (classCheck.rowCount === 0) {
        return res.status(404).json({ error: "Class not found" });
      }
      
      const { start_time, end_time, schedule_day } = classCheck.rows[0];
  
      // Check for Student Conflict
      if (await checkStudentConflict(student_id, start_time, end_time, schedule_day)) {
        return res.status(400).json({ error: "Student conflict detected" });
      }
  
      // Add Student to Class
      await pool.query(`
        INSERT INTO class_students (class_id, student_id) 
        VALUES ($1, $2)
      `, [class_id, student_id]);
  
      res.status(201).json({ message: "Student added to class successfully!" });
    } catch (error) {
      console.error('Error adding student to class:', error);
      res.status(500).json({ error: "Failed to add student to class" });
    }
  };

  // Get all students
  const getStudents = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM students');
      res.status(200).json(result.rows);
    } catch (error) {
      console.error('Failed to retrieve students:', error);
      res.status(500).json({ error: 'Failed to retrieve students' });
    }
  };

  // Get student by id
  const getStudentById = async (req, res) => {
    const { id } = req.params;
    try {
      const result = await pool.query('SELECT * FROM students WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to retrieve student:', error);
      res.status(500).json({ error: 'Failed to retrieve student' });
    }
  };

  // Update student
  const updateStudent = async (req, res) => {
    const { id } = req.params;
    const { name, email } = req.body;
  
    try {
      const result = await pool.query(
        'UPDATE students SET name = $1, email = $2 WHERE id = $3 RETURNING *',
        [name, email, id]
      );
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json(result.rows[0]);
    } catch (error) {
      console.error('Failed to update student:', error);
      res.status(500).json({ error: 'Failed to update student' });
    }
  };

  // Delete a student
  const deleteStudent = async (req, res) => {
    const { id } = req.params;
  
    try {
      const result = await pool.query('DELETE FROM students WHERE id = $1 RETURNING *', [id]);
  
      if (result.rowCount === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }
      res.status(200).json({ message: 'Student deleted successfully!' });
    } catch (error) {
      console.error('Failed to delete student:', error);
      res.status(500).json({ error: 'Failed to delete student' });
    }
  };

  // Edit student enrollment
  const editStudentEnrollment = async (req, res) => {
    const { student_id, current_class_id, new_class_id } = req.body;

    console.log('Incoming Request Body:', req.body);

    try {
        // Validate and parse IDs
        const parsedStudentId = parseInt(student_id, 10);
        const parsedCurrentClassId = parseInt(current_class_id, 10);
        const parsedNewClassId = parseInt(new_class_id, 10);

        if (isNaN(parsedStudentId) || isNaN(parsedCurrentClassId) || isNaN(parsedNewClassId)) {
            console.error('Invalid input: student_id, current_class_id, or new_class_id is not an integer');
            return res.status(400).json({ error: 'Invalid input data: IDs must be integers' });
        }

        console.log('Parsed IDs:', { parsedStudentId, parsedCurrentClassId, parsedNewClassId });

        // Check if the new class exists
        const newClassCheck = await pool.query(`SELECT * FROM classes WHERE id = $1`, [parsedNewClassId]);
        if (newClassCheck.rowCount === 0) {
            console.error('New class not found:', parsedNewClassId);
            return res.status(404).json({ error: "New class not found" });
        }

        console.log('New class exists:', newClassCheck.rows[0]);

        const { start_time, end_time, schedule_day } = newClassCheck.rows[0];

        // Check for student conflicts using the helper function
        const conflictExists = await checkStudentConflict(parsedStudentId, start_time, end_time, schedule_day);

        if (conflictExists) {
            console.error('Conflict detected with existing classes');
            return res.status(400).json({ error: "Conflict detected with existing classes" });
        }

        console.log('No conflicts found. Proceeding to update enrollment.');

        // Remove the student from the current class
        await pool.query(`
            DELETE FROM class_students 
            WHERE student_id = $1 AND class_id = $2
        `, [parsedStudentId, parsedCurrentClassId]);

        console.log('Student removed from current class:', parsedCurrentClassId);

        // Add the student to the new class
        await pool.query(`
            INSERT INTO class_students (class_id, student_id) 
            VALUES ($1, $2)
        `, [parsedNewClassId, parsedStudentId]);

        console.log('Student added to new class:', parsedNewClassId);

        res.status(200).json({ message: "Student enrollment updated successfully!" });
    } catch (error) {
        console.error("Error in editStudentEnrollment:", error);
        res.status(500).json({ error: "Failed to update student enrollment" });
    }
};






  
  

module.exports = { getClasses, createClass, updateClass, deleteClass, addStudentToClass, getStudents, getStudentById, updateStudent, deleteStudent, editStudentEnrollment };

// Controller logic found above includes:
//  - Getting all classes in db
//  - Creating new class
//  - Updating existing class
//  - Deleting class

// This file contains the logic for handling requests to each route
