import { Text, Box, Button, Spinner } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../../components/InputField";
import { Layout } from "../../../components/Layout";
import {
  usePostQuery,
  useUpdatePostMutation,
} from "../../../generated/graphql";
import { createUrqlClient } from "../../../utils/createUrqlClient";
import { useIdFromUrl } from "../../../utils/useIdFromUrl";

const Edit: React.FC<{}> = ({}) => {
  const router = useRouter();

  // Grab the id from the url
  const intId = useIdFromUrl();

  // Grab the post
  const [{ data, fetching, error }] = usePostQuery({
    pause: intId === -1,
    variables: { id: intId },
  });

  // Update mutation
  const [, updatePost] = useUpdatePostMutation();

  // Show spinning icon if fetching
  if (fetching) {
    return (
      <Layout>
        <Spinner />
      </Layout>
    );
  }

  // Display error message if err
  if (error) {
    return (
      <Layout>
        <Box>
          <Text>Sorry, something went wrong on the server.</Text>
        </Box>
      </Layout>
    );
  }

  // Handle not found post
  if (!data?.post) {
    return (
      <Layout>
        <Box>
          <Text>Sorry, can not find the post you are trying to update.</Text>
        </Box>
      </Layout>
    );
  }
  return (
    <Layout variant="small">
      <Formik
        initialValues={{ title: data.post.title, text: data.post.text }}
        onSubmit={async (values) => {
          await updatePost({
            id: intId,
            title: values.title,
            text: values.text,
          });

          // Naviagate back to the page user came from
          router.back();
        }}
      >
        {({ isSubmitting }) => {
          return (
            <Form>
              <InputField name="title" label="Title" placeholder="title" />
              <Box mt={4}>
                <InputField
                  name="text"
                  isTextarea
                  label="Body"
                  placeholder="body..."
                />
              </Box>
              <Button
                mt={4}
                type="submit"
                isLoading={isSubmitting}
                colorScheme="teal"
              >
                Update Post
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Layout>
  );
};
export default withUrqlClient(createUrqlClient)(Edit);
