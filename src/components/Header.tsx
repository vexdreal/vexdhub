export default function Header() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
      }}
    >
      <div>
        <h1
          style={{
            color: "#4da3ff",
            margin: 0,
          }}
        >
          VexdHub Admin
        </h1>

        <p
          style={{
            color: "#888",
            marginTop: "5px",
          }}
        >
          Premium Key Management System
        </p>
      </div>

      <button
        onClick={() => location.reload()}
        style={{
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
          background: "#4da3ff",
          color: "#fff",
        }}
      >
        Refresh
      </button>
    </div>
  );
}