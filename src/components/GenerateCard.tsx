type Props = {
  duration: string;
  setDuration: (value: string) => void;
  generateKey: () => void;
};

export default function GenerateCard({ duration, setDuration, generateKey }: Props) {
  return (
    <section className="panel-card generate-card">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">Quick action</span>
          <h2>Generate single license</h2>
          <p>Create one key with a selected validity period.</p>
        </div>
        <div className="panel-icon">+</div>
      </div>

      <div className="generate-controls">
        <label>
          <span>Validity</span>
          <select value={duration} onChange={(e) => setDuration(e.target.value)}>
            <option value="1">1 Day</option>
            <option value="7">7 Days</option>
            <option value="30">30 Days</option>
            <option value="90">90 Days</option>
            <option value="0">Permanent</option>
          </select>
        </label>
        <button type="button" onClick={generateKey}>Generate key</button>
      </div>
    </section>
  );
}
