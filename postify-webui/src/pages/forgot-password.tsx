import { Box, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

export const ForgotPassword: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [forgetting, setForgetting] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      {forgetting ? (
        <Box>
          An email has been sent to the one you provided. Please follow the
          instructions given there.
        </Box>
      ) : (
        <Formik
          initialValues={{ email: "" }}
          onSubmit={async (values, actions) => {
            forgotPassword(values);
            setForgetting(true);
          }}
        >
          {() => {
            return (
              <Form>
                <InputField name="email" label="Email" placeholder="email" />
                <Button mt={4} type="submit" colorScheme="teal">
                  Forgot Password
                </Button>
              </Form>
            );
          }}
        </Formik>
      )}
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
