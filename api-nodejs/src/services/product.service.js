const Product = require('../models/product.model');
const AppError = require('../utils/AppError');

function list({ search, status, page, limit }) {
  let items = Product.findAll();

  if (status) items = items.filter((p) => p.status === status);
  if (search) {
    const q = search.toLowerCase();
    items = items.filter((p) => p.name.toLowerCase().includes(q));
  }

  const total = items.length;
  const start = (page - 1) * limit;
  return { items: items.slice(start, start + limit), total, page, limit };
}

function getById(id) {
  const product = Product.findById(id);
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  return product;
}

function create(data) {
  const duplicate = Product.findAll().some((p) => p.name.toLowerCase() === data.name.toLowerCase());
  if (duplicate) throw new AppError(409, 'PRODUCT_EXISTS', 'A product with this name already exists');
  return Product.create(data);
}

function updateStatus(id, status) {
  const product = Product.updateStatus(id, status);
  if (!product) throw new AppError(404, 'PRODUCT_NOT_FOUND', 'Product not found');
  return product;
}

module.exports = { list, getById, create, updateStatus };
