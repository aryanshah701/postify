import { Box, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useMeQuery } from "../generated/graphql";

interface NavProps {}

export const Nav: React.FC<NavProps> = ({}) => {
  // Get the current user
  const [{ data, fetching }] = useMeQuery();

  // The right portion of the nav
  let rightNav = null;

  // Once the data has been fetched
  if (!fetching && data?.me.user) {
    // If the user is logged in
    rightNav = (
      <Flex>
        <NextLink href="/">
          <Link mx="2">Logout</Link>
        </NextLink>
        <NextLink href="/">
          <Link mx="2">{data.me.user?.username}</Link>
        </NextLink>
      </Flex>
    );
  } else if (!fetching && !data?.me.user) {
    // If the user isn't logged in
    console.log(data);
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
    <Flex bg="tomato" p={4} mb={8}>
      <Box ml={"auto"}>{rightNav}</Box>
    </Flex>
  );
};
