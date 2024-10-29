// src/models/Class.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Class = sequelize.define('Class', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  name: DataTypes.STRING,
  startTime: DataTypes.DATE,
  endTime: DataTypes.DATE,
});

module.exports = Class;
