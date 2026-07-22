type Props = {
  duration: string;
  setDuration: (value: string) => void;
  generateKey: () => void;
  loading?: boolean;
};

export default function GenerateCard({ duration, setDuration, generateKey, loading = false }: Props) {
  return (
    <section className="panel generate-panel">
      <div className="section-heading">
        <div>
          <p className="eyebrow">QUICK ACTION</p>
          <h2>Generate License</h2>
        </div>
        <span className="panel-icon">＋</span>
      </div>

      <p className="panel-description">Buat satu license baru dengan durasi yang dipilih.</p>

      <label className="field-label" htmlFor="single-duration">Durasi License</label>
      <select id="single-duration" value={duration} onChange={(event) => setDuration(event.target.value)}>
        <option value="1">1 Hari</option>
        <option value="7">7 Hari</option>
        <option value="30">30 Hari</option>
        <option value="90">90 Hari</option>
        <option value="0">Permanen</option>
      </select>

      <button type="button" className="button-primary full-width" onClick={generateKey} disabled={loading}>
        {loading ? "Membuat License..." : "Generate New Key"}
      </button>
    </section>
  );
}
