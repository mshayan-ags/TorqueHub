import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Category",
  endpoint: "GetAllCategorys",
});

export const CategoryContext = Context;
export const withCategoryContext = withContext;

export default Provider;
