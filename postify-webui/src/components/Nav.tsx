import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavProps {}

export const Nav: React.FC<NavProps> = ({}) => {
  // Get the current user
  const [{ data, fetching }] = useMeQuery({ pause: isServer() });
  const [{ fetching: isLoadingFetching }, logout] = useLogoutMutation();

  // The right portion of the nav
  let rightNav = null;

  // The left portion of the nav
  let leftNav = null;

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
          onClick={async () => await logout()}
          isLoading={isLoadingFetching}
        >
          Logout
        </Button>
      </Flex>
    );

    leftNav = (
      <Flex>
        <NextLink href="/create-post">
          <Link mx="2">Create Post</Link>
        </NextLink>
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
    <Flex bg="lteal" zIndex={1} position="sticky" top={0} p={4} mb={8}>
      <Box>{leftNav}</Box>
      <Box ml={"auto"}>{rightNav}</Box>
    </Flex>
  );
};
