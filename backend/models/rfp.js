const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const RFP = sequelize.define('RFP', {
  title: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT, allowNull: false },
  structuredData: { type: DataTypes.JSONB, allowNull: false }, 
  status: { type: DataTypes.STRING, defaultValue: 'created' },
});

module.exports = RFP;
