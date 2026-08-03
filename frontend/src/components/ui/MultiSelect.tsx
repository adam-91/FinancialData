import { useState, useRef, useEffect, useMemo } from "react";
import styled from "styled-components";

const Container = styled.div`
  position: relative;
  min-width: 180px;
`;

const SelectButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
  }

  svg {
    width: 12px;
    height: 12px;
    margin-left: 8px;
    color: ${({ theme }) => theme.colors.text.muted};
  }
`;

const Dropdown = styled.div<{ $open: boolean }>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 200px;
  overflow-y: auto;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: ${({ theme }) => theme.shadows.lg};
  z-index: 50;
  display: ${({ $open }) => ($open ? "block" : "none")};
`;

const Option = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.text.primary};
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.surfaceHover};
  }

  input {
    accent-color: ${({ theme }) => theme.colors.accent};
  }
`;

interface MultiSelectProps {
  options: { value: string; label: string }[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  maxSelected?: number;
}

export function MultiSelect({ options, selected, onChange, placeholder, maxSelected }: MultiSelectProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      if (maxSelected && selected.length >= maxSelected) return;
      onChange([...selected, value]);
    }
  };

  const displayText = useMemo(() => {
    if (selected.length === 0) return placeholder || "";
    return selected
      .map((val) => options.find((opt) => opt.value === val)?.label || val)
      .join(", ");
  }, [selected, options, placeholder]);

  return (
    <Container ref={containerRef}>
      <SelectButton onClick={() => setOpen(!open)}>
        <span>{displayText}</span>
        <svg fill="none" viewBox="0 0 12 12">
          <path d="M6 8L1 3h10z" fill="currentColor" />
        </svg>
      </SelectButton>
      <Dropdown $open={open}>
        {options.map((opt) => (
          <Option key={opt.value}>
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
            />
            {opt.label}
          </Option>
        ))}
      </Dropdown>
    </Container>
  );
}
