import { useEffect, useRef, useState } from 'react'
import './PomodoroTimer.css'

const DEFAULTS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
}
const STORAGE_KEY = 'pomodoro-settings'
const LABELS = { work: 'Focus Time', shortBreak: 'Short Break', longBreak: 'Long Break' }

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    return { ...DEFAULTS, ...saved }
  } catch {
    return DEFAULTS
  }
}

function durationOf(mode, settings) {
  return settings[mode] * 60
}

function clampInt(value, min, max, fallback) {
  const n = parseInt(value, 10)
  if (Number.isNaN(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function formatTime(totalSeconds) {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}

function playChime(ctx) {
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const start = ctx.currentTime + i * 0.25
    osc.type = 'sine'
    osc.frequency.value = freq
    gain.gain.setValueAtTime(0.0001, start)
    gain.gain.exponentialRampToValueAtTime(0.3, start + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.6)
    osc.connect(gain).connect(ctx.destination)
    osc.start(start)
    osc.stop(start + 0.6)
  })
}

function SettingInput({ label, value, min, max, onCommit }) {
  const [draft, setDraft] = useState(String(value))

  useEffect(() => {
    setDraft(String(value))
  }, [value])

  const commit = () => {
    const n = clampInt(draft, min, max, value)
    setDraft(String(n))
    if (n !== value) onCommit(n)
  }

  return (
    <label className="setting">
      <span>{label}</span>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === 'Enter') commit()
        }}
      />
    </label>
  )
}

export default function PomodoroTimer() {
  const [settings, setSettings] = useState(loadSettings)
  const [mode, setMode] = useState('work')
  const [remaining, setRemaining] = useState(() => durationOf('work', loadSettings()))
  const [running, setRunning] = useState(false)
  const [completed, setCompleted] = useState(0)
  const [showSettings, setShowSettings] = useState(false)

  const endTimeRef = useRef(0)
  const audioCtxRef = useRef(null)

  const total = durationOf(mode, settings)
  const progress = ((total - remaining) / total) * 100
  const n = settings.sessionsBeforeLongBreak
  const inCycle = completed === 0 ? 0 : ((completed - 1) % n) + 1
  const paused = !running && remaining < total
  const buttonLabel = running ? 'Pause' : paused ? 'Resume' : 'Start'

  // Persist settings
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
  }, [settings])

  // Real-time countdown based on timestamps, so it stays accurate in background tabs
  useEffect(() => {
    if (!running) return
    const tick = () => {
      setRemaining(Math.max(0, Math.round((endTimeRef.current - Date.now()) / 1000)))
    }
    tick()
    const id = setInterval(tick, 250)
    return () => clearInterval(id)
  }, [running])

  // Handle the end of a session
  useEffect(() => {
    if (!running || remaining > 0) return
    if (audioCtxRef.current) playChime(audioCtxRef.current)

    let nextMode = 'work'
    let nextCompleted = completed
    if (mode === 'work') {
      nextCompleted = completed + 1
      nextMode = nextCompleted % n === 0 ? 'longBreak' : 'shortBreak'
    }
    setCompleted(nextCompleted)
    setMode(nextMode)
    setRemaining(durationOf(nextMode, settings))
    setRunning(false)
  }, [remaining, running, mode, completed, settings, n])

  // Live tab title
  useEffect(() => {
    document.title = `${formatTime(remaining)} · ${LABELS[mode]}`
  }, [remaining, mode])

  const toggle = () => {
    if (running) {
      setRunning(false)
      return
    }
    // Create or resume the audio context inside a click, which browsers require
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) audioCtxRef.current = new AudioCtx()
    }
    audioCtxRef.current?.resume()
    endTimeRef.current = Date.now() + remaining * 1000
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setRemaining(durationOf(mode, settings))
  }

  const updateSetting = (key, value) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    if (!running && key === mode) setRemaining(value * 60)
  }

  return (
    <div className="pomodoro">
      <header>
        <h1>{LABELS[mode]}</h1>
        <p className="session-count">Sessions completed: {completed}</p>
      </header>

      <div className="timer-card">
        <div className="time-display" aria-live="polite">
          {formatTime(remaining)}
        </div>

        <div
          className="progress"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="dots" aria-label={`${inCycle} of ${n} sessions in this cycle`}>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className={`dot ${i < inCycle ? 'filled' : ''}`} />
          ))}
        </div>

        <div className="controls">
          <button className="primary" onClick={toggle}>
            {buttonLabel}
          </button>
          <button className="secondary" onClick={reset}>
            Reset
          </button>
        </div>
      </div>

      <section className="settings">
        <button
          className="link"
          onClick={() => setShowSettings((s) => !s)}
          aria-expanded={showSettings}
        >
          {showSettings ? 'Hide settings' : 'Edit durations'}
        </button>

        {showSettings && (
          <form className="settings-form" onSubmit={(e) => e.preventDefault()}>
            <SettingInput
              label="Focus (minutes)"
              value={settings.work}
              min={1}
              max={120}
              onCommit={(v) => updateSetting('work', v)}
            />
            <SettingInput
              label="Short break (minutes)"
              value={settings.shortBreak}
              min={1}
              max={60}
              onCommit={(v) => updateSetting('shortBreak', v)}
            />
            <SettingInput
              label="Long break (minutes)"
              value={settings.longBreak}
              min={1}
              max={120}
              onCommit={(v) => updateSetting('longBreak', v)}
            />
            <SettingInput
              label="Sessions before long break"
              value={settings.sessionsBeforeLongBreak}
              min={1}
              max={10}
              onCommit={(v) => setSettings((s) => ({ ...s, sessionsBeforeLongBreak: v }))}
            />
          </form>
        )}
      </section>
    </div>
  )
}
