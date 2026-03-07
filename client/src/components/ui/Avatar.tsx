import { uploadsUrl } from "../../lib/api";
import { colors } from "../../styles";

interface AvatarProps {
  src?: string | null;
  username: string;
  size?: number;
}

function resolveAvatarSrc(src: string): string {
  if (src.startsWith("http://") || src.startsWith("https://") || src.startsWith("/")) {
    return src;
  }
  return uploadsUrl(src);
}

export const Avatar = ({ src, username, size = 32 }: AvatarProps) => {
  if (src) {
    return (
      <img
        src={resolveAvatarSrc(src)}
        alt={username}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: colors.border,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 600,
        fontSize: size * 0.4,
        color: colors.textSecondary,
        flexShrink: 0,
        textTransform: "uppercase",
      }}
    >
      {username[0]}
    </div>
  );
};
