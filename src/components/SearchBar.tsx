type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <label className="search-box">
      <span aria-hidden="true">⌕</span>
      <input
        type="search"
        placeholder="Cari berdasarkan key atau device ID..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}
