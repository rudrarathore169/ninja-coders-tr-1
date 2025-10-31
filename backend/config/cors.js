import cors from 'cors';
import config from './config.js';

const corsOptions = {
  origin: function (origin, callback) {
    console.log('🌐 Incoming Origin:', origin); // 👈 add this line for debugging

    if (!origin) return callback(null, true);

    const allowedOrigins = [
      config.FRONTEND_URL,
      'https://www.orvella.co.in', 
      'https://ninja-coders-tr-1-qlqi5gc0b.vercel.app',
      'https://tr-1-project-ninja-coders.vercel.app',
      'https://tr-1-project-ninja-coders-v2.vercel.app',
      'http://localhost:5173',
      'http://localhost:3001',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:3001'
    ];

    if (config.NODE_ENV === 'development') {
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.error(`❌ CORS Blocked Origin: ${origin}`); // 👈 helpful log
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  optionsSuccessStatus: 200
};

export default corsOptions;
