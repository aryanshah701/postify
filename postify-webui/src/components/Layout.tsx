import React from "react";
import { Nav } from "./Nav";
import { Wrapper, WrapperVariant } from "./Wrapper";

interface LayoutProps {
  variant?: WrapperVariant;
}

export const Layout: React.FC<LayoutProps> = ({ variant, children }) => {
  return (
    <>
      <Nav />
      <Wrapper variant={variant}>{children}</Wrapper>
    </>
  );
};
