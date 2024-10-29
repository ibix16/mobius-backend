// src/models/Classroom.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Class = require('./Class');

const Classroom = sequelize.define('Classroom', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  capacity: DataTypes.INTEGER,
});

// Associations
Classroom.hasMany(Class, { foreignKey: 'classroomId' });
Class.belongsTo(Classroom, { foreignKey: 'classroomId' });

module.exports = Classroom;
