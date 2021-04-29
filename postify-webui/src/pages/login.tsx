import { Button, Box } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import React from "react";
import { InputField } from "../components/InputField";
import { useLoginMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";

const login: React.FC<{}> = ({}) => {
  const [_, login] = useLoginMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", password: "" }}
        onSubmit={async (values, actions) => {
          // Login the user
          const response = await login(values);

          console.log("response: ", response);
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
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder="username"
            />
            <Box mt={4}>
              <InputField
                name="password"
                label="Password"
                placeholder="password"
                type="password"
              />
            </Box>
            <Button
              mt={4}
              type="submit"
              isLoading={isSubmitting}
              colorScheme="teal"
            >
              Login
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default login;