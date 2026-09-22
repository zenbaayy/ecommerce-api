/**
 * In-memory "database" for products.
 * Using an array + auto-incrementing id keeps the lab focused on REST/GraphQL
 * design rather than database setup. Swap this module out for a real DB
 * (MongoDB/Postgres) later without touching route logic.
 */

let products = [
  {
    id: 1,
    name: "Wireless Mouse",
    description: "Ergonomic 2.4GHz wireless mouse with USB receiver",
    price: 19.99,
    category: "Electronics",
    stock: 150,
    sku: "ELEC-MOU-001"
  },
  {
    id: 2,
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical keyboard, blue switches",
    price: 59.99,
    category: "Electronics",
    stock: 80,
    sku: "ELEC-KEY-002"
  },
  {
    id: 3,
    name: "Cotton T-Shirt",
    description: "100% cotton crew-neck t-shirt, unisex fit",
    price: 12.5,
    category: "Apparel",
    stock: 300,
    sku: "APRL-TSH-003"
  }
];

let nextId = 4;

function getAll() {
  return products;
}

function getById(id) {
  return products.find((p) => p.id === Number(id));
}

function create(data) {
  const product = {
    id: nextId++,
    name: data.name,
    description: data.description || "",
    price: data.price,
    category: data.category || "Uncategorized",
    stock: typeof data.stock === "number" ? data.stock : 0,
    sku: data.sku || `SKU-${Date.now()}`
  };
  products.push(product);
  return product;
}

function update(id, data) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return null;

  // PUT = full replace, but we keep the same id.
  const updated = {
    id: products[index].id,
    name: data.name,
    description: data.description || "",
    price: data.price,
    category: data.category || "Uncategorized",
    stock: typeof data.stock === "number" ? data.stock : 0,
    sku: data.sku || products[index].sku
  };
  products[index] = updated;
  return updated;
}

function remove(id) {
  const index = products.findIndex((p) => p.id === Number(id));
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

module.exports = { getAll, getById, create, update, remove };
