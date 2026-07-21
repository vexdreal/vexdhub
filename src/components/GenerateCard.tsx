type Props = {
  duration: string;
  setDuration: (value: string) => void;
  generateKey: () => void;
};

export default function GenerateCard({
  duration,
  setDuration,
  generateKey,
}: Props) {
  return (
    <div
      style={{
        marginBottom: "30px",
        display: "flex",
        gap: "10px",
      }}
    >
      <select
        value={duration}
        onChange={(e) => setDuration(e.target.value)}
        style={{
          padding: "12px",
          borderRadius: "10px",
          background: "#151515",
          color: "#fff",
        }}
      >
        <option value="1">1 Hari</option>
        <option value="7">7 Hari</option>
        <option value="30">30 Hari</option>
        <option value="0">Permanent</option>
      </select>

      <button
        onClick={generateKey}
        style={{
          padding: "12px 20px",
          borderRadius: "10px",
          border: "none",
          background: "#4da3ff",
          color: "#fff",
          cursor: "pointer",
        }}
      >
        Generate Key
      </button>
    </div>
  );
}