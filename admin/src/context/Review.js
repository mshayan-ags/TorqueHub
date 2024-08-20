import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Review",
  endpoint: "GetAllReviewsAdmin",
});

export const ReviewContext = Context;
export const withReviewContext = withContext;

export default Provider;
