type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({ value, onChange }: Props) {
  return (
    <label className="search-box">
      <span className="search-icon">⌕</span>
      <input
        type="search"
        placeholder="Search license key or device ID..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}
