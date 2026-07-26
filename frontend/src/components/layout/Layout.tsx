import styled from "styled-components";
import { Header } from "./Header";
import { Footer } from "./Footer";
import { ReactNode } from "react";

const Main = styled.main`
  flex: 1;
  padding: 32px;
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <>
      <Header />
      <Main>{children}</Main>
      <Footer />
    </>
  );
}
