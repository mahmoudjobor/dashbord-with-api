const { Router } = require('express');
const productRoutes = require('./product.routes');

const router = Router();
router.use('/api/products', productRoutes);
router.get('/health', (_req, res) => res.json({ status: 'ok', uptime: Math.round(process.uptime()) }));

module.exports = router;
