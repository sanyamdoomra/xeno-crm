## Mini CRM Platform Development Guidelines

This is a full-stack Mini CRM Platform built with Node.js backend and React.js frontend.

### Project Structure
- `backend/` - Node.js API server with Express, Sequelize, Redis
- `frontend/` - React.js UI with Material-UI components
- Database: MySQL with Sequelize ORM
- Authentication: Google OAuth 2.0
- Message Queue: Redis Streams for pub-sub architecture

### Key Features
- Customer and order data ingestion via REST APIs
- Dynamic audience segmentation with rule builder
- Campaign management with delivery simulation
- Swagger API documentation at `/api-docs`
- Session-based authentication with Google OAuth

### Development Commands
- Backend: `cd backend && npm run dev`
- Frontend: `cd frontend && npm run dev`
- Both servers must be running for full functionality

### Architecture Notes
- APIs publish to Redis Streams, data saves directly to MySQL
- Campaign creation triggers automatic message delivery simulation
- All API endpoints documented via Swagger UI
- Frontend uses Material-UI for consistent design

### Environment Requirements
- MySQL (XAMPP), Redis, Node.js
- Google OAuth credentials required
- OpenAI API key for AI features (optional)

Work through each component systematically.
Keep communication concise and focused.
Follow development best practices.
