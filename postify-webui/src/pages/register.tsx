import { Button, Box } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { Wrapper } from "../components/Wrapper";
import React from "react";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrorMap } from "../utils/toErrorMap";
import { useRouter } from "next/router";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

interface registerProps {}

const register: React.FC<registerProps> = ({}) => {
  const [_, register] = useRegisterMutation();
  const router = useRouter();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ username: "", email: "", password: "" }}
        onSubmit={async (values, actions) => {
          // Register the user
          const response = await register(values);

          // Check for any errors
          if (response.data?.register.errors) {
            const errors = toErrorMap(response.data?.register.errors);
            actions.setErrors(errors);

            // Naviagate to the index as a result of successful registeration
          } else if (response.data?.register.user) {
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
                name="email"
                label="Email"
                placeholder="email"
                type="email"
              />
            </Box>
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
              Register
            </Button>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(register);
