import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "User",
  endpoint: "GetAllUsers",
});

export const UserContext = Context;
export const withUserContext = withContext;

export default Provider;
