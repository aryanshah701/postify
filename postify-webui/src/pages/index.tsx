import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";
import React from "react";
import { Layout } from "../components/Layout";

const Index = () => {
  const [{ data }] = usePostsQuery();

  return (
    <Layout>
      {!data
        ? null
        : data.posts.map((post) => <p key={post.id}>{post.title}</p>)}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
