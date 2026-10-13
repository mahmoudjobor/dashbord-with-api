// Routes define endpoints and middleware order only.
const { Router } = require('express');
const controller = require('../controllers/product.controller');
const { authenticate, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const schemas = require('../schemas/product.schema');

const router = Router();

router.use(authenticate); // every product route requires a valid JWT

router.get('/', validate({ query: schemas.listQuery }), controller.list);
router.get('/:id', validate({ params: schemas.idParams }), controller.getById);
router.post('/', requireRole('admin'), validate({ body: schemas.createProductBody }), controller.create);
router.put(
  '/:id/status',
  requireRole('admin'),
  validate({ params: schemas.idParams, body: schemas.updateStatusBody }),
  controller.updateStatus,
);

module.exports = router;
