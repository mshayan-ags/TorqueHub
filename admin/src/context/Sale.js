import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Sale",
  endpoint: "GetAllSale",
  transform: (d) => [...(d || [])].reverse(),
});

export const SaleContext = Context;
export const withSaleContext = withContext;

export default Provider;
