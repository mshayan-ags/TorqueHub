import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Address",
  endpoint: "GetAllAddresss",
});

export const AddressContext = Context;
export const withAddressContext = withContext;

export default Provider;
