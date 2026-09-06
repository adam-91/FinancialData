import styled from "styled-components";
import { ReactNode } from "react";

const Screen = styled.div`
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: ${({ theme }) => theme.colors.background};
`;

const Card = styled.div`
  width: 100%;
  max-width: 400px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 40px 32px;
  box-shadow: ${({ theme }) => theme.shadows.lg};
`;

const Title = styled.h1`
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 700;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Subtitle = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <Screen>
      <Card>
        <Title>{title}</Title>
        {subtitle && <Subtitle>{subtitle}</Subtitle>}
        {children}
      </Card>
    </Screen>
  );
}
