# E-Commerce API — CSC337 Lab Assignment 03

A local Node.js/Express REST API for a simple E-Commerce product catalog,
plus a GraphQL endpoint that solves the classic REST "over-fetching"
problem.

## Setup & Running

```bash
npm install
npm start
```

Server runs at `http://localhost:3000`.

- **Dashboard (start here)**: `http://localhost:3000/` — a simple frontend
  with buttons and forms to list/add/update/delete products, test
  pagination and field-selection, and run GraphQL queries. Every action
  shows the exact raw JSON your server returned, so you can see the
  request/response pair directly.
- REST base URL: `http://localhost:3000/api/v1/products`
- GraphQL endpoint: `http://localhost:3000/graphql` (open directly in a
  browser for the built-in GraphiQL playground)

Data is stored in memory (`src/data/products.js`), so it resets whenever
the server restarts — no database setup required.

## REST API

| Method | Endpoint                | Description                          |
|--------|--------------------------|---------------------------------------|
| GET    | `/api/v1/products`       | List all products                    |
| GET    | `/api/v1/products/:id`   | Get a single product                 |
| POST   | `/api/v1/products`       | Create a new product                 |
| PUT    | `/api/v1/products/:id`   | Replace a product (idempotent)       |
| DELETE | `/api/v1/products/:id`   | Delete a product (idempotent)        |

### RESTful pillars followed

- **Resource-based URLs**: `/products`, `/products/:id` — nouns, not verbs.
- **Correct HTTP verbs**: GET (read), POST (create), PUT (full replace),
  DELETE (remove).
- **Idempotency**: calling `PUT` or `DELETE` on the same resource
  repeatedly leaves the system in the same end state. `DELETE` on an
  already-deleted id correctly returns `404` since the resource is
  (still) absent either way — it's not creating a new side effect.
- **Standardized JSON errors** — every error, from every route, has the
  same shape (`error_code`, `message`, `timestamp`):
  ```json
  {
    "error_code": "PRODUCT_NOT_FOUND",
    "message": "Product with id 99 not found.",
    "timestamp": "2026-09-23T05:53:10.128Z"
  }
  ```
  Common `error_code` values: `VALIDATION_ERROR` (400), `PRODUCT_NOT_FOUND`
  (404), `ROUTE_NOT_FOUND` (404), `INTERNAL_SERVER_ERROR` (500).

### Filtering, pagination & partial responses (solving over-fetching)

```bash
# All products
curl http://localhost:3000/api/v1/products

# Only id, name, price — client picks exactly the fields it needs
curl "http://localhost:3000/api/v1/products?fields=id,name,price"

# Filter by category
curl "http://localhost:3000/api/v1/products?category=Electronics"

# Pagination — 5 products starting at offset 0
curl "http://localhost:3000/api/v1/products?limit=5&offset=0"

# All can be combined
curl "http://localhost:3000/api/v1/products?category=Electronics&fields=name,price&limit=5&offset=0"
```
Paginated responses include metadata so the client knows how to page
further:
```json
{ "data": [...], "pagination": { "total": 20, "limit": 5, "offset": 0, "count": 5 } }
```

### Create / Update / Delete examples

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Desk Lamp","price":24.99,"category":"Home","stock":40}'

curl -X PUT http://localhost:3000/api/v1/products/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Wireless Mouse Pro","price":24.99,"category":"Electronics","stock":100}'

curl -X DELETE http://localhost:3000/api/v1/products/1
```

## GraphQL

Open `http://localhost:3000/graphql` in a browser for an interactive
GraphiQL playground, or POST queries directly:

```bash
curl -X POST http://localhost:3000/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ products { id name price } }"}'
```

**This is the core demo of solving over-fetching:** in REST, `GET
/api/v1/products` always returns every field unless you remember to add
`?fields=`. In GraphQL, the client's query itself defines the shape of
the response — asking for `{ id name price }` can *only* ever return
those three fields, nothing more.

```graphql
# Query a single product with only the fields you want
{
  product(id: "2") {
    name
    price
  }
}

# Mutation: create a product
mutation {
  addProduct(name: "Notebook", price: 3.5, category: "Stationery", stock: 200) {
    id
    name
  }
}
```

## Error Handling

All errors are funneled through one centralized handler
(`src/middleware/errorHandler.js`) so every failure — validation, missing
route, missing resource — returns the same JSON shape:

```json
{ "error": { "code": 400, "message": "`name` is required and must be a non-empty string." } }
```

## Project Structure

```
ecommerce-api/
├── server.js                    # app entry point, wires everything together
├── public/index.html            # test dashboard — served at http://localhost:3000/
├── src/
│   ├── data/products.js         # in-memory data + CRUD functions
│   ├── routes/products.js       # REST route handlers
│   ├── middleware/errorHandler.js
│   ├── utils/selectFields.js    # ?fields= partial-response helper
│   └── graphql/schema.js        # GraphQL types, queries, mutations
├── package.json
└── README.md
```

## Publishing to GitHub (for submission)

```bash
cd ecommerce-api
git init
git add .
git commit -m "CSC337 Lab 03: RESTful API + GraphQL"
git branch -M main
git remote add origin https://github.com/zenbaayy/ecommerce-api.git
git push -u origin main
```


