import { useAuth } from "../hooks/useAuth";

export const Feed = () => {
  const { user } = useAuth();

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome, {user?.name || user?.username}!</h1>
      <p>This is your feed. More features coming soon.</p>
    </div>
  );
};
