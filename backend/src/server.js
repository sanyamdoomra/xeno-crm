require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const passport = require('passport');
const session = require('express-session');
const { sequelize } = require('./models');


const GoogleStrategy = require('passport-google-oauth20').Strategy;

// Register Google OAuth strategy
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // You can save/find user in DB here
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((obj, done) => {
  done(null, obj);
});


const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Session and Passport setup
app.use(session({ secret: process.env.SESSION_SECRET || 'crmsecret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Swagger setup
const swaggerDocument = YAML.load('./src/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));


// Routers
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);
app.use('/api/customers', require('./routes/customers'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/segments', require('./routes/segments'));
app.use('/api/campaigns', require('./routes/campaigns'));
app.use('/api/vendor', require('./routes/vendor'));
app.use('/api/receipts', require('./routes/receipts'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Debug endpoint to check database contents
app.get('/debug/data', async (req, res) => {
  const { Customer, Order, Segment, Campaign, CommunicationLog } = require('./models');
  try {
    const data = {
      customers: await Customer.findAll(),
      orders: await Order.findAll(),
      segments: await Segment.findAll(),
      campaigns: await Campaign.findAll(),
      logs: await CommunicationLog.findAll()
    };
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Check database connection and table status
app.get('/debug/tables', async (req, res) => {
  const { sequelize } = require('./models');
  try {
    await sequelize.authenticate();
    const tables = await sequelize.query("SHOW TABLES", { type: sequelize.QueryTypes.SELECT });
    res.json({ 
      connection: 'OK', 
      database: process.env.DB_NAME || 'xeno',
      tables: tables 
    });
  } catch (error) {
    res.status(500).json({ error: error.message, connection: 'FAILED' });
  }
});

const PORT = process.env.PORT || 4000;

sequelize.sync({ force: true }).then(() => {
  console.log('Database synced with force: true');
  app.listen(PORT, () => {
    console.log(`CRM backend running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database sync failed:', err);
});
