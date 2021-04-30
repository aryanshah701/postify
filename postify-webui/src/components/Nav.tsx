import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";

interface NavProps {}

export const Nav: React.FC<NavProps> = ({}) => {
  // Get the current user
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: fetchingLogout }, logout] = useLogoutMutation();

  // The right portion of the nav
  let rightNav = null;

  // Once the data has been fetched
  if (!fetching && data?.me.user) {
    // If the user is logged in
    rightNav = (
      <Flex>
        <NextLink href="/">
          <Link mx="2">{data.me.user?.username}</Link>
        </NextLink>
        <Button
          mx="2"
          variant="link"
          onClick={() => logout()}
          isFetching={fetchingLogout}
        >
          Logout
        </Button>
      </Flex>
    );
  } else if (!fetching && !data?.me.user) {
    // If the user isn't logged in
    rightNav = (
      <Flex>
        <NextLink href="/login">
          <Link mx="2">Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link mx="2">Register</Link>
        </NextLink>
      </Flex>
    );
  }

  return (
    <Flex bg="lteal" p={4} mb={8}>
      <Box ml={"auto"}>{rightNav}</Box>
    </Flex>
  );
};
