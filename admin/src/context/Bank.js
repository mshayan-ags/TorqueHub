import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Bank",
  endpoint: "GetAllBanks",
});

export const BankContext = Context;
export const withBankContext = withContext;

export default Provider;
