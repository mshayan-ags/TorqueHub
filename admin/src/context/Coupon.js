import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Coupon",
  endpoint: "GetAllCoupons",
});

export const CouponContext = Context;
export const withCouponContext = withContext;

export default Provider;
