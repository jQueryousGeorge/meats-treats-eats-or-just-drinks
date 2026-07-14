import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import ModeSelect from './components/ModeSelect'
import CuisineSelect from './components/CuisineSelect'
import DiceSpinner from './components/DiceSpinner'
import ManageRestaurants from './components/ManageRestaurants'
import { fetchRestaurants } from './api/restaurants'
import './App.css'

const SPIN_STEPS = 22

function pickRandom(pool) {
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function App() {
  const [restaurants, setRestaurants] = useState(null)
  const [loadError, setLoadError] = useState(null)
  const [screen, setScreen] = useState('mode') // 'mode' | 'cuisine' | 'spin' | 'manage'
  const [selectedCuisine, setSelectedCuisine] = useState(null)
  const [display, setDisplay] = useState(null)
  const [spinning, setSpinning] = useState(false)
  const [hasResult, setHasResult] = useState(false)
  const spinToken = useRef(0)

  useEffect(() => {
    fetchRestaurants()
      .then(setRestaurants)
      .catch((err) => setLoadError(err.message || 'Failed to load restaurants.'))
  }, [])

  const cuisines = useMemo(
    () => (restaurants ? [...new Set(restaurants.map((r) => r.cuisine))].sort() : []),
    [restaurants],
  )

  const pool = useMemo(() => {
    if (!restaurants) return []
    return selectedCuisine ? restaurants.filter((r) => r.cuisine === selectedCuisine) : restaurants
  }, [restaurants, selectedCuisine])

  const startSpin = useCallback(() => {
    if (pool.length === 0) return
    const myToken = ++spinToken.current
    const final = pickRandom(pool)
    setSpinning(true)
    setHasResult(false)

    let step = 0
    const runStep = () => {
      if (spinToken.current !== myToken) return
      const isLast = step === SPIN_STEPS - 1
      setDisplay(isLast ? final : pickRandom(pool))
      if (isLast) {
        setSpinning(false)
        setHasResult(true)
        return
      }
      step += 1
      const delay = 40 + step * 7 // decelerate toward the end
      setTimeout(runStep, delay)
    }
    runStep()
  }, [pool])

  const goToMode = () => {
    spinToken.current++
    setScreen('mode')
    setSelectedCuisine(null)
    setDisplay(null)
    setSpinning(false)
    setHasResult(false)
  }

  const goToCuisine = () => {
    spinToken.current++
    setScreen('cuisine')
    setSelectedCuisine(null)
    setDisplay(null)
    setSpinning(false)
    setHasResult(false)
  }

  const pickRandomMode = () => {
    setSelectedCuisine(null)
    setScreen('spin')
    setDisplay(null)
    setHasResult(false)
  }

  const pickCuisine = (cuisine) => {
    setSelectedCuisine(cuisine)
    setScreen('spin')
    setDisplay(null)
    setHasResult(false)
  }

  if (loadError) {
    return (
      <div className="app">
        <div className="panel">
          <h1 className="title">Couldn't load restaurants</h1>
          <p className="subtitle">{loadError}</p>
          <p className="subtitle">Is the API server running? (`npm run server`)</p>
        </div>
      </div>
    )
  }

  if (!restaurants) {
    return (
      <div className="app">
        <div className="panel">
          <p className="subtitle">Loading restaurants…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app">
      <div className="app-stack">
        {screen === 'mode' && <ModeSelect onPickRandom={pickRandomMode} onPickCuisine={goToCuisine} />}

        {screen === 'cuisine' && (
          <CuisineSelect cuisines={cuisines} onPick={pickCuisine} onBack={goToMode} />
        )}

        {screen === 'spin' && (
          <div className="panel">
            <button className="back-link" onClick={selectedCuisine ? goToCuisine : goToMode}>
              ← Back
            </button>
            <h1 className="title">
              {selectedCuisine ? `Rolling for ${selectedCuisine}` : 'Rolling the full menu'}
            </h1>
            <DiceSpinner
              display={display}
              spinning={spinning}
              hasResult={hasResult}
              onSpin={startSpin}
            />
            {hasResult && (
              <div className="post-actions">
                {selectedCuisine && (
                  <button className="text-button" onClick={goToCuisine}>
                    Change Cuisine
                  </button>
                )}
                <button className="text-button" onClick={goToMode}>
                  Start Over
                </button>
              </div>
            )}
          </div>
        )}

        {screen === 'manage' && (
          <ManageRestaurants
            restaurants={restaurants}
            cuisines={cuisines}
            onChange={setRestaurants}
            onBack={goToMode}
          />
        )}

        {screen !== 'manage' && (
          <button className="manage-link" onClick={() => setScreen('manage')}>
            ✏️ View / edit restaurant list
          </button>
        )}
      </div>
    </div>
  )
}
