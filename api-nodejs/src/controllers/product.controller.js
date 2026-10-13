// Controllers only translate HTTP <-> service calls. No business logic here.
const productService = require('../services/product.service');

function list(req, res) {
  const { items, total, page, limit } = productService.list(req.validated.query);
  res.json({ data: items, meta: { total, page, limit } });
}

function getById(req, res) {
  res.json({ data: productService.getById(req.validated.params.id) });
}

function create(req, res) {
  const product = productService.create(req.validated.body);
  res.status(201).json({ data: product });
}

function updateStatus(req, res) {
  const product = productService.updateStatus(req.validated.params.id, req.validated.body.status);
  res.json({ data: product });
}

module.exports = { list, getById, create, updateStatus };
