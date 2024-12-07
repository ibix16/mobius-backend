const pool = require('../config/db');

const getClasses = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM classes');
    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const createClass = async (req, res) => {
  const { title, description, start_time, end_time, classroom_id, instructor_id } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO classes (title, description, start_time, end_time, classroom_id, instructor_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, description, start_time, end_time, classroom_id, instructor_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateClass = async (req, res) => {
  const { id } = req.params;
  const { title, description, start_time, end_time, classroom_id, instructor_id } = req.body;
  try {
    const result = await pool.query(
      `UPDATE classes SET title = $1, description = $2, start_time = $3, end_time = $4, classroom_id = $5, instructor_id = $6
       WHERE id = $7 RETURNING *`,
      [title, description, start_time, end_time, classroom_id, instructor_id, id]
    );
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteClass = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM classes WHERE id = $1', [id]);
    res.status(200).json({ message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getClasses, createClass, updateClass, deleteClass };


// Controller logic found above includes :
  // getting all classes in db 
  // creating new class 
  // updating exisiting class
  // deleting class 






// This file contains the logic for handling requests to each route