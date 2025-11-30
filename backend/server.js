const fastify = require('fastify')({ logger: true });
const { Pool } = require('pg');
require('dotenv').config();

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

// Register chat routes
fastify.register(require('./routes/chat'), { prefix: '/api/chat' });

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