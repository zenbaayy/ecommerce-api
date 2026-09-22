const {
  GraphQLObjectType,
  GraphQLSchema,
  GraphQLString,
  GraphQLFloat,
  GraphQLInt,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull
} = require("graphql");
const db = require("../data/products");

// A GraphQL client only ever gets back the exact fields it asks for in its
// query - this is the built-in fix for REST over-fetching that the lab
// wants demonstrated (compare to /api/v1/products?fields=... on the REST side).
const ProductType = new GraphQLObjectType({
  name: "Product",
  fields: () => ({
    id: { type: GraphQLID },
    name: { type: GraphQLString },
    description: { type: GraphQLString },
    price: { type: GraphQLFloat },
    category: { type: GraphQLString },
    stock: { type: GraphQLInt },
    sku: { type: GraphQLString }
  })
});

const RootQuery = new GraphQLObjectType({
  name: "RootQueryType",
  fields: {
    products: {
      type: new GraphQLList(ProductType),
      args: { category: { type: GraphQLString } },
      resolve(parent, args) {
        let products = db.getAll();
        if (args.category) {
          products = products.filter(
            (p) => p.category.toLowerCase() === args.category.toLowerCase()
          );
        }
        return products;
      }
    },
    product: {
      type: ProductType,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        return db.getById(args.id);
      }
    }
  }
});

const Mutation = new GraphQLObjectType({
  name: "Mutation",
  fields: {
    addProduct: {
      type: ProductType,
      args: {
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        category: { type: GraphQLString },
        stock: { type: GraphQLInt },
        sku: { type: GraphQLString }
      },
      resolve(parent, args) {
        return db.create(args);
      }
    },
    updateProduct: {
      type: ProductType,
      args: {
        id: { type: new GraphQLNonNull(GraphQLID) },
        name: { type: new GraphQLNonNull(GraphQLString) },
        description: { type: GraphQLString },
        price: { type: new GraphQLNonNull(GraphQLFloat) },
        category: { type: GraphQLString },
        stock: { type: GraphQLInt },
        sku: { type: GraphQLString }
      },
      resolve(parent, args) {
        return db.update(args.id, args);
      }
    },
    deleteProduct: {
      type: GraphQLString,
      args: { id: { type: new GraphQLNonNull(GraphQLID) } },
      resolve(parent, args) {
        const ok = db.remove(args.id);
        return ok ? `Product ${args.id} deleted.` : `Product ${args.id} not found.`;
      }
    }
  }
});

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation
});
