"use client";

import { useState } from "react";

type Result = {
  diff: number;
  regen: number;
  final: number;
};

export default function StaminaCalculator() {
  const [stamina, setStamina] = useState("40:46");
  const [start, setStart] = useState("03:50");
  const [end, setEnd] = useState("10:00");
  const [state, setState] = useState("pz");
  const [result, setResult] = useState<Result | null>(null);

  const toMinutes = (time: string): number => {
    const [h, m] = time.split(":").map(Number);
    return h * 60 + m;
  };

  const format = (min: number): string => {
    const h = Math.floor(min / 60);
    const m = min % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
  };

  const calculate = () => {
    let staminaMin = toMinutes(stamina);
    let startMin = toMinutes(start);
    let endMin = toMinutes(end);

    if (endMin < startMin) endMin += 1440;

    const diff = endMin - startMin;
    const isGreen = staminaMin >= 2340; // 39:00+

    let rate: number;
    if (isGreen) {
      rate = state === "pz" ? 5 : 6;
    } else {
      rate = state === "trainer" ? 6 : 3;
    }

    const regen = Math.floor(diff / rate);
    staminaMin = Math.min(2520, staminaMin + regen);

    setResult({
      diff,
      regen,
      final: staminaMin,
    });
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">
          Stamina Rubinot
        </h1>

        <div className="space-y-4">
          <div>
            <label className="text-sm">Stamina atual</label>
            <input
              value={stamina}
              onChange={(e) => setStamina(e.target.value)}
              className="w-full p-2 rounded bg-neutral-700"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm">Horário atual</label>
              <input
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full p-2 rounded bg-neutral-700"
              />
            </div>
            <div>
              <label className="text-sm">Horário alvo</label>
              <input
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full p-2 rounded bg-neutral-700"
              />
            </div>
          </div>

          <div>
            <label className="text-sm">Situação</label>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full p-2 rounded bg-neutral-700"
            >
              <option value="offline">Offline</option>
              <option value="pz">Online em PZ</option>
              <option value="trainer">Trainer</option>
            </select>
          </div>

          <button
            onClick={calculate}
            className="w-full bg-green-600 hover:bg-green-700 transition p-3 rounded-xl font-bold"
          >
            Calcular
          </button>
        </div>

        {result && (
          <div className="mt-6 bg-neutral-900 p-4 rounded-xl text-sm space-y-2">
            <div>
              ⏳ Tempo decorrido: {Math.floor(result.diff / 60)}h{" "}
              {result.diff % 60}min
            </div>
            <div>
              🔄 Regenerado: {Math.floor(result.regen / 60)}h{" "}
              {result.regen % 60}min
            </div>
            <div className="text-lg font-bold mt-2">
              ✅ Stamina final: {format(result.final)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
