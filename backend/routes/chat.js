const jwt = require('jsonwebtoken');

// JWT authentication middleware
async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.code(401).send({ message: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    request.user = decoded;
  } catch (err) {
    return reply.code(401).send({ message: 'Invalid token' });
  }
}

async function chatRoutes(fastify, options) {
  // Apply authentication to all chat routes
  fastify.addHook('preHandler', authenticate);

  // Get chat history
  fastify.get('/:chatId', async (request, reply) => {
    const { chatId } = request.params;
    const userId = request.user.id;

    try {
      const result = await fastify.pg.query(
        'SELECT messages FROM chat_histories WHERE user_id = $1 AND chat_id = $2',
        [userId, chatId]
      );

      if (result.rows.length === 0) {
        return reply.send({ messages: [] });
      }

      reply.send({ messages: result.rows[0].messages });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ message: 'Server error' });
    }
  });

  // Save chat history
  fastify.post('/:chatId', async (request, reply) => {
    const { chatId } = request.params;
    const { messages } = request.body;
    const userId = request.user.id;

    try {
      // Upsert the chat history
      await fastify.pg.query(`
        INSERT INTO chat_histories (user_id, chat_id, messages, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, chat_id)
        DO UPDATE SET messages = $3, updated_at = NOW()
      `, [userId, chatId, JSON.stringify(messages)]);

      reply.send({ message: 'Chat history saved' });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ message: 'Server error' });
    }
  });
}

module.exports = chatRoutes;