const express = require("express");
const router = express.Router();
const db = require("../data/products");
const { ApiError } = require("../middleware/errorHandler");
const { selectFields, selectFieldsList } = require("../utils/selectFields");

function validateProductBody(body, { partial = false } = {}) {
  const errors = [];
  if (!partial || body.name !== undefined) {
    if (typeof body.name !== "string" || body.name.trim() === "") {
      errors.push("`name` is required and must be a non-empty string.");
    }
  }
  if (!partial || body.price !== undefined) {
    if (typeof body.price !== "number" || body.price < 0) {
      errors.push("`price` is required and must be a non-negative number.");
    }
  }
  if (body.stock !== undefined && typeof body.stock !== "number") {
    errors.push("`stock` must be a number.");
  }
  return errors;
}

// GET /api/v1/products?fields=name,price&category=Electronics&limit=5&offset=0
router.get("/", (req, res, next) => {
  let products = db.getAll();

  if (req.query.category) {
    products = products.filter(
      (p) => p.category.toLowerCase() === String(req.query.category).toLowerCase()
    );
  }

  const total = products.length;

  // Pagination: ?limit=5&offset=10  (offset defaults to 0, limit defaults
  // to returning everything). Keeps large catalog payloads small.
  let limit = req.query.limit !== undefined ? Number(req.query.limit) : total;
  let offset = req.query.offset !== undefined ? Number(req.query.offset) : 0;

  if (req.query.limit !== undefined && (!Number.isInteger(limit) || limit < 0)) {
    return next(new ApiError(400, "VALIDATION_ERROR", "`limit` must be a non-negative integer."));
  }
  if (req.query.offset !== undefined && (!Number.isInteger(offset) || offset < 0)) {
    return next(new ApiError(400, "VALIDATION_ERROR", "`offset` must be a non-negative integer."));
  }

  const page = products.slice(offset, offset + limit);
  const shaped = selectFieldsList(page, req.query.fields);

  res.status(200).json({
    data: shaped,
    pagination: { total, limit, offset, count: shaped.length }
  });
});

// GET /api/v1/products/:id?fields=name,price
router.get("/:id", (req, res, next) => {
  const product = db.getById(req.params.id);
  if (!product) {
    return next(
      new ApiError(404, "PRODUCT_NOT_FOUND", `Product with id ${req.params.id} not found.`)
    );
  }
  res.status(200).json({ data: selectFields(product, req.query.fields) });
});

// POST /api/v1/products
router.post("/", (req, res, next) => {
  const errors = validateProductBody(req.body || {});
  if (errors.length > 0) {
    return next(new ApiError(400, "VALIDATION_ERROR", errors.join(" ")));
  }
  const created = db.create(req.body);
  res.status(201).json({ data: created });
});

// PUT /api/v1/products/:id  (full replace -> idempotent)
router.put("/:id", (req, res, next) => {
  const existing = db.getById(req.params.id);
  if (!existing) {
    return next(
      new ApiError(404, "PRODUCT_NOT_FOUND", `Product with id ${req.params.id} not found.`)
    );
  }
  const errors = validateProductBody(req.body || {});
  if (errors.length > 0) {
    return next(new ApiError(400, "VALIDATION_ERROR", errors.join(" ")));
  }
  const updated = db.update(req.params.id, req.body);
  res.status(200).json({ data: updated });
});

// DELETE /api/v1/products/:id  (idempotent: deleting twice ends in the
// same final state - "resource absent" - so retrying a delete after a
// network failure never causes a second side effect; a repeat delete of
// an already-gone id returns 404, the standard interpretation for DELETE.)
router.delete("/:id", (req, res, next) => {
  const deleted = db.remove(req.params.id);
  if (!deleted) {
    return next(
      new ApiError(404, "PRODUCT_NOT_FOUND", `Product with id ${req.params.id} not found.`)
    );
  }
  res.status(204).send();
});

module.exports = router;
