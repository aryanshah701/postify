import { Nav } from "../components/Nav";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <>
      <Nav />
      {!data
        ? null
        : data.posts.map((post) => <p key={post.id}>{post.title}</p>)}
    </>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
