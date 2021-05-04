import { Button, Box, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import React from "react";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from "next-urql";

const login: React.FC<{}> = ({}) => {
  const [_, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ usernameOrEmail: "", password: "" }}
        onSubmit={async (values, actions) => {
          // Login the user
          const response = await login(values);

          // Check for any errors
          if (response.data?.login.errors) {
            const errors = toErrorMap(response.data?.login.errors);
            actions.setErrors(errors);

            // Naviagate to the index as a result of successful registeration
          } else if (response.data?.login.user) {
            router.push("/");
          }

          return response;
        }}
      >
        {({ isSubmitting }) => {
          return (
            <Form>
              <InputField
                name="usernameOrEmail"
                label="Username/Email"
                placeholder="username or email"
              />
              <Box mt={4}>
                <InputField
                  name="password"
                  label="Password"
                  placeholder="password"
                  type="password"
                />
              </Box>
              <Flex mt={4}>
                <NextLink href="/forgot-password">
                  <Link ml="auto">Forgot Password?</Link>
                </NextLink>
              </Flex>
              <Flex>
                <Button
                  mt={4}
                  mx={2}
                  type="submit"
                  isLoading={isSubmitting}
                  colorScheme="teal"
                >
                  Login
                </Button>
                <NextLink href="/register">
                  <Button
                    mt={4}
                    mx={2}
                    isLoading={isSubmitting}
                    colorScheme="teal"
                  >
                    Register Here
                  </Button>
                </NextLink>
              </Flex>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(login);
