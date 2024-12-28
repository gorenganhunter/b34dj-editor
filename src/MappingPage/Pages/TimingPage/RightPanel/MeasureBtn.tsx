import React, { useState, useEffect } from "react"
import Button from "@mui/material/Button"
import { TimingState } from "../sharedState"
import { useTranslation } from "react-i18next"
import { Music } from "../../../states"
import { addHotkey } from "../../../../Common/hooks"
import { useObserver } from "mobx-react-lite"

function calcMeasureRaw(taps: number[]) {
  const d = (taps.length / 2) | 0
  let sum = 0
  let i = 0
  for (; i + d < taps.length; i++) {
    sum += taps[i + d] - taps[i]
  }
  const beattime = sum / d / i
  const bpm = 60 / beattime
  sum = 0
  i = 0
  for (; i < taps.length; i++) {
    sum += taps[i] - i * beattime
  }
  const offset = sum / i
  return { bpm, offset }
}

function calcMeasure(taps: number[]) {
  const res = calcMeasureRaw(taps)
  let recalc = false
  const beattime = 60 / res.bpm
  const processed = [taps[0]]
  for (let i = 1; i < taps.length; i++) {
    const current = taps[i]
    const last = processed[processed.length - 1]
    const dt = current - last
    if (dt < beattime * 0.3) {
      recalc = true                 // ignore multi taps in one beat
    } else if (dt > beattime * 1.7) {
      processed.push(last + beattime) // push missed taps
      i--
      recalc = true
    } else {
      processed.push(current)
    }
  }
  if (recalc) return calcMeasureRaw(processed)
  return res
}

const state = {
  taps: [] as number[],
  timeoutId: undefined as any,
}

const startMeasure = (setLen: (v: number) => void) => {
  const currentpos = Music.position()

  state.taps.push(currentpos)
  setLen(state.taps.length)
  if (state.taps.length >= 5) {
    const res = calcMeasure(state.taps)
    TimingState.bpm = res.bpm
    TimingState.time = res.offset
  }
  TimingState.measuring = true

  clearTimeout(state.timeoutId)
  state.timeoutId = setTimeout(() => {
    state.taps.length = 0
    TimingState.measuring = false
    setLen(0)
  }, 3000)
}
const MeasureBtn = () => {

  const [length, setLen] = useState(0)

  useEffect(() => addHotkey("t", () => {[
    startMeasure(setLen)
  ]}), [])

  const { t } = useTranslation()

  return useObserver(() =>
    <Button fullWidth disableRipple onClick={() => startMeasure(setLen)} disabled={!Music.playing}
      title={t("Hotkey: {{ hotkey }}", { hotkey: "t" })}>
      {!Music.playing
        ? t("Play the music to start measure")
        : length <= 0
          ? t("Click here or press 'T' to measure")
          : length < 5
            ? t("More {{ count }} times", { count: 5 - length })
            : t("Keep stable")}
    </Button>)
}

export default MeasureBtn
