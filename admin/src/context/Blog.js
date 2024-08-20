import { createEntityContext } from "./factory";

const { Context, withContext, Provider } = createEntityContext({
  name: "Blog",
  endpoint: "GetAllBlogs",
});

export const BlogContext = Context;
export const withBlogContext = withContext;

export default Provider;
