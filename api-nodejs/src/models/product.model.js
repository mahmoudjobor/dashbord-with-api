const { randomUUID } = require('crypto');

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {number} price
 * @property {'active'|'inactive'|'out_of_stock'} status
 * @property {string} createdAt ISO-8601 date
 */

/** In-memory store (a real DB would replace only this file). @type {Map<string, Product>} */
const store = new Map();

/** @returns {Product} */
function build({ name, price, status }) {
  return { id: randomUUID(), name, price, status, createdAt: new Date().toISOString() };
}

function seed() {
  const samples = [
    ['Arabic Coffee Beans 500g', 12.5, 'active'],
    ['Olive Oil 1L', 18, 'active'],
    ["Za'atar Mix 250g", 6.75, 'active'],
    ['Wireless Mouse', 24.9, 'out_of_stock'],
    ['USB-C Cable 2m', 9.99, 'active'],
    ['Bluetooth Speaker', 59, 'inactive'],
    ['Stainless Steel Bottle', 15.25, 'active'],
    ['Notebook A5 (3-pack)', 7.5, 'out_of_stock'],
  ];
  samples.forEach(([name, price, status], i) => {
    const p = build({ name, price, status });
    p.createdAt = new Date(Date.now() - i * 86_400_000).toISOString();
    store.set(p.id, p);
  });
}
seed();

module.exports = {
  /** @returns {Product[]} newest first */
  findAll: () => [...store.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  /** @returns {Product|undefined} */
  findById: (id) => store.get(id),
  /** @returns {Product} */
  create: (data) => {
    const product = build(data);
    store.set(product.id, product);
    return product;
  },
  /** @returns {Product|undefined} */
  updateStatus: (id, status) => {
    const product = store.get(id);
    if (!product) return undefined;
    product.status = status;
    return product;
  },
};
