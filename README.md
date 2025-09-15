# Mini CRM Platform

A full-stack Customer Relationship Management platform built with Node.js, React, MySQL, and Redis.

## 🚀 Features

- **Data Ingestion APIs**: Secure REST endpoints for customer and order data with pub-sub architecture
- **Dynamic Audience Segmentation**: Flexible rule builder with AND/OR logic and real-time audience preview
- **Campaign Management**: Automated campaign creation with delivery simulation and logging
- **Google OAuth Authentication**: Secure login system
- **API Documentation**: Complete Swagger/OpenAPI documentation
- **Real-time Delivery Tracking**: Simulated vendor API with delivery receipts and batch processing

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js, Sequelize ORM
- **Frontend**: React.js, Material-UI, Axios
- **Database**: MySQL
- **Message Queue**: Redis Streams
- **Authentication**: Google OAuth 2.0
- **API Docs**: Swagger UI

## 📦 Installation & Setup

### Prerequisites
- Node.js (v16+)
- MySQL (XAMPP recommended)
- Redis
- Google OAuth credentials

### Backend Setup
```bash
cd backend
npm install
```

### Frontend Setup
```bash
cd frontend
npm install
```

### Environment Configuration
Create `backend/.env`:
```
DB_NAME=xeno
DB_USER=root
DB_PASS=
DB_HOST=127.0.0.1
DB_PORT=3306
SESSION_SECRET=crmsecret
REDIS_URL=redis://localhost:6379
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
OPENAI_API_KEY=your_openai_api_key
```

## 🚀 Running the Application

1. **Start MySQL and Redis**
   - Start XAMPP MySQL
   - Run `redis-server`

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```
   Backend runs on: http://localhost:4000

3. **Start Frontend**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on: http://localhost:5173

## 📖 API Documentation

Visit http://localhost:4000/api-docs for complete API documentation via Swagger UI.

### Key Endpoints:
- `POST /api/customers` - Ingest customer data
- `POST /api/orders` - Ingest order data
- `POST /api/segments` - Create audience segments
- `GET /api/campaigns` - List campaigns with stats
- `POST /api/vendor/send` - Simulate message delivery
- `POST /api/receipts` - Handle delivery receipts

## 🎯 Demo Flow

1. **Login**: Visit frontend and sign in with Google
2. **Data Ingestion**: Use Swagger UI to add customers and orders
3. **Create Segments**: Use the rule builder to define audience criteria
4. **View Campaigns**: Check campaign history with delivery stats
5. **API Testing**: Explore all endpoints via Swagger documentation

## 🏗 Architecture

- **Pub-Sub Pattern**: APIs publish to Redis Streams, consumers process asynchronously
- **Microservices**: Modular service layer for campaigns, segments, and delivery
- **Session-Based Auth**: Google OAuth with Express sessions
- **Responsive UI**: Material-UI components with drag-and-drop functionality

## 📊 Assignment Compliance

✅ **Data Ingestion APIs** - Secure, documented REST endpoints with pub-sub architecture  
✅ **Campaign Creation UI** - Dynamic rule builder with preview functionality  
✅ **Campaign Delivery & Logging** - Simulated vendor API with delivery tracking  
✅ **Authentication** - Google OAuth 2.0 implementation  
✅ **AI Integration** - OpenAI API ready for message suggestions and rule generation  
✅ **Tech Stack** - React.js frontend, Node.js backend, MySQL database  

## 🎨 AI Features (Ready to Implement)

The platform is prepared for AI-powered features:
- Natural language to segment rules conversion
- AI-driven message suggestions
- Campaign performance summarization
- Smart scheduling recommendations

## 🚧 Development

- Backend: Nodemon for hot reloading
- Frontend: Vite dev server with HMR
- Database: Sequelize migrations and models
- Testing: API endpoints via Swagger UI

---

**Built for the Mini CRM Platform Assignment**  
Demonstrates modern full-stack development with pub-sub architecture, OAuth authentication, and comprehensive API documentation.