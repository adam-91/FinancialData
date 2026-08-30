import { useState } from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import {
  useUsers,
  useCreateUser,
  useUpdateUser,
  useDeleteUser,
  useGenerateResetLink,
} from "../hooks/useUsers";
import { AddTickerSection } from "../components/admin/AddTickerSection";
import { AddIndexSection } from "../components/admin/AddIndexSection";
import { RefreshDataSection } from "../components/admin/RefreshDataSection";
import { isAxiosError } from "axios";

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
`;

const Title = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Section = styled.div`
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: 24px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const FormRow = styled.form`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  flex-wrap: wrap;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.text.primary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.accent};
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 12px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.border};
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.text.secondary};
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  color: ${({ theme }) => theme.colors.text.primary};
`;

const Badge = styled.span<{ $active?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 11px;
  font-weight: 600;
  background: ${({ theme, $active }) =>
    $active ? theme.colors.successBg : theme.colors.dangerBg};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.success : theme.colors.danger};
`;

const PrimaryButton = styled.button`
  padding: 10px 16px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.accent};
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.colors.accentHover};
  }

  &:disabled {
    opacity: 0.6;
    cursor: default;
  }
`;

const GhostButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: transparent;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: 13px;
  cursor: pointer;
  margin-right: 8px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const DangerButton = styled(GhostButton)`
  color: ${({ theme }) => theme.colors.danger};

  &:hover {
    border-color: ${({ theme }) => theme.colors.danger};
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const Message = styled.div<{ $type: "error" | "success" }>`
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: 13px;
  background: ${({ theme, $type }) =>
    $type === "error" ? theme.colors.dangerBg : theme.colors.successBg};
  color: ${({ theme, $type }) =>
    $type === "error" ? theme.colors.danger : theme.colors.success};
`;

const ResetLink = styled.div`
  margin-top: 8px;
  padding: 10px 12px;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  background: ${({ theme }) => theme.colors.background};
  border: 1px dashed ${({ theme }) => theme.colors.border};
  font-size: 12px;
  word-break: break-all;
  color: ${({ theme }) => theme.colors.text.secondary};
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  white-space: nowrap;
`;

export function AdminPage() {
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { data: users, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();
  const resetMutation = useGenerateResetLink();

  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editEmail, setEditEmail] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editActive, setEditActive] = useState(true);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [resetLinks, setResetLinks] = useState<Record<number, string>>({});

  const errorText = (err: unknown, fallback: string) => {
    if (isAxiosError(err)) return err.response?.data?.detail || fallback;
    return fallback;
  };

  const handleCreate = async () => {
    setMessage(null);
    try {
      await createMutation.mutateAsync({ email: newEmail, password: newPassword });
      setNewEmail("");
      setNewPassword("");
      setMessage({ type: "success", text: t("admin.userCreated") });
    } catch (err) {
      setMessage({ type: "error", text: errorText(err, t("admin.error")) });
    }
  };

  const startEdit = (id: number, email: string, active: boolean) => {
    setEditingId(id);
    setEditEmail(email);
    setEditPassword("");
    setEditActive(active);
  };

  const handleUpdate = async (id: number) => {
    setMessage(null);
    try {
      await updateMutation.mutateAsync({
        id,
        data: {
          email: editEmail,
          is_active: editActive,
          ...(editPassword ? { password: editPassword } : {}),
        },
      });
      setEditingId(null);
      setMessage({ type: "success", text: t("admin.userUpdated") });
    } catch (err) {
      setMessage({ type: "error", text: errorText(err, t("admin.error")) });
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm(t("admin.confirmDelete"))) return;
    setMessage(null);
    try {
      await deleteMutation.mutateAsync(id);
      setMessage({ type: "success", text: t("admin.userDeleted") });
    } catch (err) {
      setMessage({ type: "error", text: errorText(err, t("admin.error")) });
    }
  };

  const handleResetLink = async (id: number) => {
    setMessage(null);
    try {
      const result = await resetMutation.mutateAsync(id);
      setResetLinks((prev) => ({ ...prev, [id]: result.reset_url }));
    } catch (err) {
      setMessage({ type: "error", text: errorText(err, t("admin.error")) });
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <PageContainer>
      <Header>
        <Title>{t("admin.title", "Admin panel")}</Title>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <span style={{ fontSize: 14, color: "inherit" }}>
            {user?.email}
          </span>
          <GhostButton onClick={handleLogout}>
            {t("admin.logout", "Log out")}
          </GhostButton>
        </div>
      </Header>

      {message && <Message $type={message.type}>{message.text}</Message>}

      <Section>
        <SectionTitle>{t("admin.createUser", "Create user")}</SectionTitle>
        <FormRow
          onSubmit={(e) => {
            e.preventDefault();
            handleCreate();
          }}
        >
          <Field>
            <Label>{t("admin.email", "Email")}</Label>
            <Input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
          </Field>
          <Field>
            <Label>{t("admin.password", "Password")}</Label>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </Field>
          <PrimaryButton type="submit" disabled={createMutation.isPending}>
            {t("admin.create", "Create")}
          </PrimaryButton>
        </FormRow>
      </Section>

      <Section>
        <SectionTitle>{t("admin.usersList", "Users")}</SectionTitle>
        {isLoading ? (
          <div>{t("admin.loading", "Loading...")}</div>
        ) : (
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <Th>{t("admin.email", "Email")}</Th>
                  <Th>{t("admin.status", "Status")}</Th>
                  <Th>{t("admin.mustChange", "Must change password")}</Th>
                  <Th>{t("admin.actions", "Actions")}</Th>
                </tr>
              </thead>
              <tbody>
                {users?.map((u) => (
                  <tr key={u.id}>
                    <Td>
                      {editingId === u.id ? (
                        <Input
                          value={editEmail}
                          onChange={(e) => setEditEmail(e.target.value)}
                        />
                      ) : (
                        u.email
                      )}
                    </Td>
                    <Td>
                      {editingId === u.id ? (
                        <select
                          value={editActive ? "1" : "0"}
                          onChange={(e) => setEditActive(e.target.value === "1")}
                        >
                          <option value="1">{t("admin.active", "Active")}</option>
                          <option value="0">{t("admin.inactive", "Inactive")}</option>
                        </select>
                      ) : (
                        <Badge $active={u.is_active}>
                          {u.is_active
                            ? t("admin.active", "Active")
                            : t("admin.inactive", "Inactive")}
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      {u.must_change_password
                        ? t("admin.yes", "Yes")
                        : t("admin.no", "No")}
                    </Td>
                    <Td>
                      {editingId === u.id ? (
                        <>
                          <Input
                            type="password"
                            placeholder={t("admin.newPassword", "New password")}
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                          />
                          <Actions>
                            <PrimaryButton onClick={() => handleUpdate(u.id)}>
                              {t("admin.save", "Save")}
                            </PrimaryButton>
                            <GhostButton onClick={() => setEditingId(null)}>
                              {t("admin.cancel", "Cancel")}
                            </GhostButton>
                          </Actions>
                        </>
                      ) : (
                        <Actions>
                          <GhostButton
                            onClick={() => startEdit(u.id, u.email, u.is_active)}
                          >
                            {t("admin.edit", "Edit")}
                          </GhostButton>
                          <GhostButton onClick={() => handleResetLink(u.id)}>
                            {t("admin.resetPassword", "Reset password")}
                          </GhostButton>
                          <DangerButton onClick={() => handleDelete(u.id)}>
                            {t("admin.delete", "Delete")}
                          </DangerButton>
                        </Actions>
                      )}
                      {resetLinks[u.id] && (
                        <ResetLink>{resetLinks[u.id]}</ResetLink>
                      )}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>
        )}
      </Section>

      <AddTickerSection />

      <AddIndexSection />

      <RefreshDataSection />
    </PageContainer>
  );
}
