import styled from "styled-components";
import { ReactNode } from "react";

const TileContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  overflow: hidden;
`;

const TileHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surfaceHover};
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }
`;

const TileTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
  margin: 0;
`;

const DragHandle = styled.span`
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.text.muted};

  svg {
    width: 16px;
    height: 16px;
  }
`;

const TileContent = styled.div`
  flex: 1;
  padding: 16px;
  overflow: auto;
`;

interface TileWrapperProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export function TileWrapper({ title, children, className }: TileWrapperProps) {
  return (
    <TileContainer className={className}>
      <TileHeader>
        <TileTitle>{title}</TileTitle>
        <DragHandle>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </DragHandle>
      </TileHeader>
      <TileContent>{children}</TileContent>
    </TileContainer>
  );
}
