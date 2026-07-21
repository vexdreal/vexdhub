type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Cari Key..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "14px",
        borderRadius: "10px",
        border: "1px solid #333",
        background: "#151515",
        color: "#fff",
        marginBottom: "20px",
      }}
    />
  );
}