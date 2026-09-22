/**
 * Solves classic REST "over-fetching": a client can pass ?fields=name,price
 * to get back only the keys it needs instead of the whole object.
 * Example: GET /api/v1/products?fields=id,name,price
 */
function selectFields(obj, fieldsParam) {
  if (!fieldsParam) return obj;

  const requested = fieldsParam
    .split(",")
    .map((f) => f.trim())
    .filter(Boolean);

  if (requested.length === 0) return obj;

  const result = {};
  requested.forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(obj, field)) {
      result[field] = obj[field];
    }
  });
  return result;
}

function selectFieldsList(list, fieldsParam) {
  if (!fieldsParam) return list;
  return list.map((item) => selectFields(item, fieldsParam));
}

module.exports = { selectFields, selectFieldsList };
