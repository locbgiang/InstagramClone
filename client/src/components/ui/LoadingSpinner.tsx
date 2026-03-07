import { colors } from "../../styles";

interface LoadingSpinnerProps {
  size?: number;
}

export const LoadingSpinner = ({ size = 32 }: LoadingSpinnerProps) => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem",
      }}
    >
      <div
        style={{
          width: size,
          height: size,
          border: `3px solid ${colors.borderLight}`,
          borderTopColor: colors.textSecondary,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
};
