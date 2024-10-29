import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "ReturnRequest",
  endpoint: "GetAllReturnRequest",
});

export const ReturnRequestContext = Context;
export const withReturnRequestContext = withContext;

export default Provider;
