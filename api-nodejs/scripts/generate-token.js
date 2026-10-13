// Usage: npm run token -- admin   |   npm run token -- viewer
const jwt = require('jsonwebtoken');
const env = require('../src/config/env');

const role = process.argv[2] === 'admin' ? 'admin' : 'viewer';
const token = jwt.sign({ sub: `dev-${role}`, role }, env.JWT_SECRET, { algorithm: 'HS256', expiresIn: '1h' });
console.log(token);
