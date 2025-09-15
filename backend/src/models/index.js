const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME || 'crm', process.env.DB_USER || 'root', process.env.DB_PASS || '', {
  host: process.env.DB_HOST || 'localhost',
  dialect: 'mysql',
  logging: false
});

const Customer = sequelize.define('Customer', {
  name: DataTypes.STRING,
  email: DataTypes.STRING,
  phone: DataTypes.STRING,
  totalSpend: DataTypes.FLOAT,
  visits: DataTypes.INTEGER,
  lastActive: DataTypes.DATE
});

const Order = sequelize.define('Order', {
  customerId: DataTypes.INTEGER,
  amount: DataTypes.FLOAT,
  date: DataTypes.DATE
});

const Segment = sequelize.define('Segment', {
  rules: DataTypes.JSON,
  logic: DataTypes.STRING
});

const Campaign = sequelize.define('Campaign', {
  name: DataTypes.STRING,
  segmentId: DataTypes.INTEGER,
  message: DataTypes.STRING,
  tags: DataTypes.STRING,
  stats: DataTypes.JSON
});

const CommunicationLog = sequelize.define('CommunicationLog', {
  campaignId: DataTypes.INTEGER,
  customerId: DataTypes.INTEGER,
  status: DataTypes.STRING
});

Customer.hasMany(Order, { foreignKey: 'customerId' });
Order.belongsTo(Customer, { foreignKey: 'customerId' });

Segment.hasMany(Campaign, { foreignKey: 'segmentId' });
Campaign.belongsTo(Segment, { foreignKey: 'segmentId' });

Campaign.hasMany(CommunicationLog, { foreignKey: 'campaignId' });
CommunicationLog.belongsTo(Campaign, { foreignKey: 'campaignId' });

module.exports = {
  sequelize,
  Customer,
  Order,
  Segment,
  Campaign,
  CommunicationLog
};
