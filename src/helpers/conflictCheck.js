const pool = require('../config/db');

// Classroom Conflict Check
const checkClassroomConflict = async (classroom_id, start_time, end_time, schedule_day, class_id = null) => {
  const query = `
    SELECT * 
    FROM classes
    WHERE classroom_id = $1
      AND schedule_day = $2
      AND (
        (start_time, end_time) OVERLAPS ($3::timestamp, $4::timestamp)
      )
      ${class_id ? 'AND id != $5' : ''}
  `;
  
  const values = class_id
    ? [classroom_id, schedule_day, start_time, end_time, class_id]
    : [classroom_id, schedule_day, start_time, end_time];
  
  const result = await pool.query(query, values);
  return result.rowCount > 0;  // True if conflict exists
};

// Instructor Conflict Check
const checkInstructorConflict = async (instructor_ids, start_time, end_time, schedule_day, class_id = null) => {
  const query = `
    SELECT DISTINCT c.id
    FROM classes c
    JOIN class_instructors ci ON ci.class_id = c.id
    WHERE ci.instructor_id = ANY($1::int[])
      AND c.schedule_day = $2
      AND (
        (c.start_time, c.end_time) OVERLAPS ($3::timestamp, $4::timestamp)
      )
      ${class_id ? 'AND c.id != $5' : ''}
  `;

  const values = class_id
    ? [instructor_ids, schedule_day, start_time, end_time, class_id]
    : [instructor_ids, schedule_day, start_time, end_time];

  const result = await pool.query(query, values);
  return result.rowCount > 0;  // True if conflict exists
};

module.exports = {
  checkClassroomConflict,
  checkInstructorConflict
};
