const path = require('path');
const fastify = require('fastify')({ logger: true });
const { Pool } = require('pg');

// Explicitly load env variables from backend/.env.local (or .env) so DB config is available
require('dotenv').config({ path: path.join(__dirname, '.env.local') });

// Register plugins
fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3001',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
});

fastify.register(require('@fastify/postgres'), {
  connectionString: `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
});

// Routes
fastify.get('/', async (request, reply) => {
  return { message: 'Backend is running' };
});

// Register auth routes
fastify.register(require('./routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./routes/places'), { prefix: '/api/places' });
fastify.register(require('./routes/traditions'), { prefix: '/api/traditions' });

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 5001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
