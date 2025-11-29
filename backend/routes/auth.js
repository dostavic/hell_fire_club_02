const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

async function authRoutes(fastify, options) {
  // Email transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Register
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body;

    try {
      // Check if user exists
      const userExists = await fastify.pg.query('SELECT * FROM users WHERE email = $1', [email]);
      if (userExists.rows.length > 0) {
        return reply.code(400).send({ message: 'User already exists' });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Generate verification token
      const verificationToken = crypto.randomBytes(32).toString('hex');

      // Insert user
      const newUser = await fastify.pg.query(
        'INSERT INTO users (email, password_hash, verification_token) VALUES ($1, $2, $3) RETURNING *',
        [email, hashedPassword, verificationToken]
      );

      // Send verification email
      const verificationUrl = `http://localhost:3000/#/auth?token=${verificationToken}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Verify your email',
        html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

      reply.code(201).send({ message: 'User registered. Please check your email to verify.' });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ message: 'Server error' });
    }
  });

  // Verify email
  fastify.get('/verify', async (request, reply) => {
    const { token } = request.query;

    try {
      const user = await fastify.pg.query('SELECT * FROM users WHERE verification_token = $1', [token]);
      if (user.rows.length === 0) {
        return reply.code(400).send({ message: 'Invalid token' });
      }

      await fastify.pg.query('UPDATE users SET is_verified = TRUE, verification_token = NULL WHERE id = $1', [user.rows[0].id]);

      // Generate JWT for auto-login
      const jwtToken = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      reply.send({ 
        message: 'Email verified successfully', 
        token: jwtToken, 
        user: { id: user.rows[0].id, email: user.rows[0].email } 
      });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ message: 'Server error' });
    }
  });

  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;

    try {
      const user = await fastify.pg.query('SELECT * FROM users WHERE email = $1', [email]);
      if (user.rows.length === 0) {
        return reply.code(400).send({ message: 'Invalid credentials' });
      }

      const validPassword = await bcrypt.compare(password, user.rows[0].password_hash);
      if (!validPassword) {
        return reply.code(400).send({ message: 'Invalid credentials' });
      }

      if (!user.rows[0].is_verified) {
        return reply.code(400).send({ message: 'Please verify your email first' });
      }

      const token = jwt.sign({ id: user.rows[0].id, email: user.rows[0].email }, process.env.JWT_SECRET, { expiresIn: '1h' });

      reply.send({ token, user: { id: user.rows[0].id, email: user.rows[0].email } });
    } catch (err) {
      console.error(err);
      reply.code(500).send({ message: 'Server error' });
    }
  });
}

module.exports = authRoutes;