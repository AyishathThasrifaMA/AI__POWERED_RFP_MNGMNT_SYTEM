const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const RFP = require('./rfp');
const Vendor = require('./vendor');

const Proposal = sequelize.define('Proposal', {
  rfpId: { type: DataTypes.INTEGER, references: { model: RFP, key: 'id' } },
  vendorId: { type: DataTypes.INTEGER, references: { model: Vendor, key: 'id' } },
  content: { type: DataTypes.JSONB }, 
  rawEmail: { type: DataTypes.TEXT },
});

RFP.hasMany(Proposal, { foreignKey: 'rfpId' });
Vendor.hasMany(Proposal, { foreignKey: 'vendorId' });
Proposal.belongsTo(RFP, { foreignKey: 'rfpId' });
Proposal.belongsTo(Vendor, { foreignKey: 'vendorId' });

module.exports = Proposal;
