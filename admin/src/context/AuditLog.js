import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "AuditLog",
  endpoint: "GetAllAuditLog",
});

export const AuditLogContext = Context;
export const withAuditLogContext = withContext;

export default Provider;
