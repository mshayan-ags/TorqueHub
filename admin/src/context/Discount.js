import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Discount",
  endpoint: "GetAllDiscounts",
});

export const DiscountContext = Context;
export const withDiscountContext = withContext;

export default Provider;
