import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import { isServer } from "../utils/isServer";

interface NavProps {}

const NavBrand: React.FC<{}> = ({}) => {
  return (
    <NextLink href="/">
      <Link mx="2" fontSize="2xl" fontWeight="bold">
        Postify
      </Link>
    </NextLink>
  );
};

export const Nav: React.FC<NavProps> = ({}) => {
  // Get the current user
  const [{ data, fetching }] = useMeQuery();
  const [{ fetching: isLoadingFetching }, logout] = useLogoutMutation();

  // The right portion of the nav
  let rightNav = null;

  // The left portion of the nav
  let leftNav = null;

  // Once the data has been fetched
  if (!fetching && data?.me.user) {
    // If the user is logged in
    rightNav = (
      <Flex align="center">
        <NextLink href="/create-post">
          <Button as={Link} mx="2">
            Create Post
          </Button>
        </NextLink>
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
      <Flex align="center">
        <NavBrand />
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
    leftNav = (
      <Flex align="center">
        <NavBrand />
      </Flex>
    );
  }

  return (
    <Flex bg="lteal" zIndex={1} position="sticky" top={0} p={4} mb={8}>
      <Flex
        flex={1}
        m="auto"
        align="center"
        maxW={800}
        zIndex={1}
        m-wposition="sticky"
        top={0}
      >
        <Box>{leftNav}</Box>
        <Box ml={"auto"}>{rightNav}</Box>
      </Flex>
    </Flex>
  );
};
