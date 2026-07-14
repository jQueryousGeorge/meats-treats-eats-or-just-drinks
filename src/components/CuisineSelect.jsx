export default function CuisineSelect({ cuisines, onPick, onBack }) {
  return (
    <div className="panel">
      <button className="back-link" onClick={onBack}>
        ← Back
      </button>
      <h1 className="title">What are you in the mood for?</h1>
      <div className="chip-grid">
        {cuisines.map((cuisine) => (
          <button key={cuisine} className="chip" onClick={() => onPick(cuisine)}>
            {cuisine}
          </button>
        ))}
      </div>
    </div>
  )
}
