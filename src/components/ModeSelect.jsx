export default function ModeSelect({ onPickRandom, onPickCuisine }) {
  return (
    <div className="panel">
      <h1 className="title">Where We Eating? 🎲</h1>
      <p className="subtitle">Pick how you want to decide.</p>
      <div className="mode-grid">
        <button className="mode-card" onClick={onPickRandom}>
          <span className="mode-emoji">🎲</span>
          <span className="mode-label">Surprise Me</span>
          <span className="mode-desc">Roll across every restaurant</span>
        </button>
        <button className="mode-card" onClick={onPickCuisine}>
          <span className="mode-emoji">🍜</span>
          <span className="mode-label">Pick a Cuisine</span>
          <span className="mode-desc">Narrow it down first, then roll</span>
        </button>
      </div>
    </div>
  )
}
