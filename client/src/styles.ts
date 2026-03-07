import type { CSSProperties } from "react";

export const colors = {
  primary: "#0095f6",
  primaryHover: "#1877f2",
  primaryDisabled: "#b3d9ff",
  error: "#ed4956",
  text: "#262626",
  textSecondary: "#8e8e8e",
  border: "#dbdbdb",
  borderLight: "#efefef",
  bgSecondary: "#fafafa",
  surface: "#ffffff",
  liked: "#ed4956",
};

export const inputStyle: CSSProperties = {
  width: "100%",
  padding: "0.5rem 0.75rem",
  border: `1px solid ${colors.border}`,
  borderRadius: "8px",
  fontSize: "0.95rem",
  fontFamily: "inherit",
  boxSizing: "border-box",
  outline: "none",
};

export const textareaStyle: CSSProperties = {
  ...inputStyle,
  resize: "vertical" as const,
  minHeight: "80px",
};

export const buttonPrimaryStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: colors.primary,
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

export const buttonSecondaryStyle: CSSProperties = {
  padding: "0.5rem 1rem",
  backgroundColor: colors.borderLight,
  color: colors.text,
  border: "none",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
  fontSize: "0.95rem",
  fontFamily: "inherit",
};

export const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: "4px",
  fontWeight: 600,
  fontSize: "0.9rem",
  color: colors.text,
};

export const formGroupStyle: CSSProperties = {
  marginBottom: "1rem",
};

export const errorTextStyle: CSSProperties = {
  color: colors.error,
  fontSize: "0.9rem",
  marginBottom: "1rem",
  textAlign: "center" as const,
};
