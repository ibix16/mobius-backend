// src/models/associations.js
const User = require('./User');
const Class = require('./Class');
const Classroom = require('./Classroom');
const Attendance = require('./Attendance');
const Notification = require('./Notification');

// Define associations here
User.hasMany(Class, { as: 'teacherClasses', foreignKey: 'teacherId' });
Class.belongsTo(User, { as: 'teacher', foreignKey: 'teacherId' });

User.hasMany(Attendance, { as: 'studentAttendance', foreignKey: 'studentId' });
Attendance.belongsTo(User, { as: 'student', foreignKey: 'studentId' });

Class.hasMany(Attendance, { as: 'classAttendance', foreignKey: 'classId' });
Attendance.belongsTo(Class, { foreignKey: 'classId' });

Class.belongsTo(Classroom, { foreignKey: 'classroomId' });
Classroom.hasMany(Class, { foreignKey: 'classroomId' });

Notification.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Notification, { foreignKey: 'userId' });

module.exports = {
  User,
  Class,
  Classroom,
  Attendance,
  Notification,
};
