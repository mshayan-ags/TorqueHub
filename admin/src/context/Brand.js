import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Brand",
  endpoint: "GetAllBrands",
});

export const BrandContext = Context;
export const withBrandContext = withContext;

export default Provider;
