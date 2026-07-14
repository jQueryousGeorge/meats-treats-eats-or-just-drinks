export default function DiceSpinner({ display, spinning, hasResult, onSpin }) {
  return (
    <div className="spinner-wrap">
      <div className={`reel ${spinning ? 'reel-spinning' : ''} ${hasResult ? 'reel-landed' : ''}`}>
        {display ? (
          <>
            <div className="reel-emoji">{display.emoji}</div>
            <div className="reel-name">{display.name}</div>
            {hasResult && (
              <>
                <div className="reel-cuisine">{display.cuisine}</div>
                {display.blurb && <div className="reel-blurb">{display.blurb}</div>}
              </>
            )}
          </>
        ) : (
          <div className="reel-emoji reel-placeholder">🍽️</div>
        )}
      </div>
      <button className="spin-button" onClick={onSpin} disabled={spinning}>
        {spinning ? 'Rolling…' : hasResult ? 'Spin Again' : '🎲 Spin!'}
      </button>
    </div>
  )
}
