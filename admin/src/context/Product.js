import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Product",
  endpoint: "GetAllProducts",
});

export const ProductContext = Context;
export const withProductContext = withContext;

export default Provider;
