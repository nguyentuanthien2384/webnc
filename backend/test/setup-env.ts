import { randomBytes } from 'crypto';

// This suite must never connect to the application's configured database.
process.env.DATABASE_URL = `mongodb://127.0.0.1:27017/unishare_e2e_${Date.now()}_${randomBytes(4).toString('hex')}`;
process.env.JWT_SECRET = randomBytes(32).toString('hex');
process.env.API_URL = 'http://localhost:8000';
process.env.FRONTEND_URL = 'http://localhost:3000';
