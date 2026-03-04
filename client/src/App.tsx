import { useEffect, useState } from "react";

function App() {
  const [health, setHealth] = useState<string>("checking...");

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(`${data.status} | db: ${data.db}`))
      .catch(() => setHealth("error -- server unreachable"));
  }, []);

  return (
    <div style={{ padding: "2rem", fontFamily: "system-ui" }}>
      <h1>Instagram Clone</h1>
      <p>API Status: {health}</p>
    </div>
  );
}

export default App;
