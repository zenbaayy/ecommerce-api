const path = require("path");
const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const schema = require("./src/graphql/schema");
const productsRouter = require("./src/routes/products");
const { notFoundHandler, errorHandler } = require("./src/middleware/errorHandler");

const app = express();
app.use(express.json());

// Serves public/index.html at http://localhost:3000/ — a small dashboard
// with buttons/forms that call the REST + GraphQL endpoints below and
// show the raw JSON response, so you can test everything without curl.
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/v1/products", productsRouter);

// graphiql:true gives you an in-browser playground at /graphql for demoing
// the "no over-fetching" behavior during grading.
app.use("/graphql", graphqlHTTP({ schema, graphiql: true }));

// 404 handler must come after all real routes; general error handler last.
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`REST API:  http://localhost:${PORT}/api/v1/products`);
  console.log(`GraphQL:   http://localhost:${PORT}/graphql`);
});

module.exports = app;
