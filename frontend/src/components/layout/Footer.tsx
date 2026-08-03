import styled from "styled-components";

const FooterContainer = styled.footer`
  padding: 24px 32px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  text-align: center;
  margin-top: auto;

  p {
    font-size: 13px;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

export function Footer() {
  return (
    <FooterContainer>
      <p>Financial Data Dashboard &copy; {new Date().getFullYear()}</p>
    </FooterContainer>
  );
}
