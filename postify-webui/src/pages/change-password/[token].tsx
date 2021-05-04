import { Box, Button, Flex, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient, NextComponentType } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrorMap } from "../../utils/toErrorMap";

export const ChangePassword: React.FC<{}> = ({}) => {
  const [, changePassword] = useChangePasswordMutation();
  const router = useRouter();
  const [tokenError, setTokenError] = useState("");

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, actions) => {
          // Attempt to change the user's password
          const response = await changePassword({
            newPassword: values.newPassword,
            token:
              typeof router.query.token === "string" ? router.query.token : "",
          });

          // Check for any errors
          const respErrors = response.data?.changePassword.errors;
          if (respErrors) {
            // Handle token error
            const errorMap = toErrorMap(respErrors);
            if ("token" in errorMap) {
              setTokenError(errorMap["token"]);
            }

            actions.setErrors(errorMap);

            // Naviagate to the index as a result of successful change password
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }

          return response;
        }}
      >
        {() => {
          return (
            <Form>
              <InputField
                name="newPassword"
                label="New Password"
                placeholder="new password"
              />
              {tokenError ? (
                <Flex mt={2}>
                  <Box color="red" mr={2}>
                    {tokenError}
                  </Box>
                  <NextLink href="/forgot-password">
                    <Link>Grab a new one?</Link>
                  </NextLink>
                </Flex>
              ) : null}
              <Button mt={4} type="submit" colorScheme="teal">
                Change Password
              </Button>
            </Form>
          );
        }}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ChangePassword);
