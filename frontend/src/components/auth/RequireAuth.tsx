import { ReactNode, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../contexts/AuthContext";

const Center = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading, openLoginModal } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      openLoginModal();
    }
  }, [loading, user, openLoginModal]);

  if (loading) {
    return <Center>Loading...</Center>;
  }

  if (!user) {
    return <Center>Login required</Center>;
  }

  if (user.must_change_password && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return <>{children}</>;
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <Center>Loading...</Center>;
  }

  if (user) {
    return (
      <Navigate
        to={user.must_change_password ? "/change-password" : "/admin"}
        replace
      />
    );
  }

  return <>{children}</>;
}
