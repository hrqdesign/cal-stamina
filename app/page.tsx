"use client";

import { useEffect, useState } from "react";

const MAX_STAMINA = 2520; // 42h
const REFILL = 60; // 1h

function toMinutes(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function format(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

function regen(minutes: number, stamina: number, mode: "offline" | "online") {
  const green = stamina >= 2340;
  const rate = green ? (mode === "online" ? 5 : 6) : 3;
  return Math.floor(minutes / rate);
}

export default function StaminaCalculator() {
  const [stamina, setStamina] = useState("40:46");
  const [currentTime, setCurrentTime] = useState("03:50");

  const [hunt1Start, setHunt1Start] = useState("10:00");
  const [hunt1End, setHunt1End] = useState("12:00");

  const [hunt2Start, setHunt2Start] = useState("18:00");
  const [hunt2End, setHunt2End] = useState("20:30");

  const [useRefill, setUseRefill] = useState(false);
  const [weekly, setWeekly] = useState(false);

  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    let staminaMin = toMinutes(stamina);
    let now = toMinutes(currentTime);

    const results: any[] = [];

    for (let day = 1; day <= (weekly ? 5 : 1); day++) {
      let dayLog: any = { day };

      // stamina inicial
      dayLog.start = staminaMin;

      // descanso noite
      let nightStart = now;
      let h1Start = toMinutes(hunt1Start);
      if (h1Start < nightStart) h1Start += 1440;
      const nightRest = h1Start - nightStart;

      const regenNight = regen(nightRest, staminaMin, "offline");
      staminaMin = Math.min(MAX_STAMINA, staminaMin + regenNight);

      dayLog.nightRest = {
        from: nightStart,
        to: h1Start,
        duration: nightRest,
        recovered: regenNight,
      };

      // hunt 1
      const h1End = toMinutes(hunt1End);
      const dur1 = h1End - toMinutes(hunt1Start);
      dayLog.hunt1 = {
        start: staminaMin,
        end: Math.max(0, staminaMin - dur1),
      };
      staminaMin = dayLog.hunt1.end;

      // descanso entre hunts
      let h2Start = toMinutes(hunt2Start);
      if (h2Start < h1End) h2Start += 1440;
      const restBetween = h2Start - h1End;
      const regenBetween = regen(restBetween, staminaMin, "offline");
      staminaMin = Math.min(MAX_STAMINA, staminaMin + regenBetween);

      dayLog.betweenRest = {
        from: h1End,
        to: h2Start,
        duration: restBetween,
        recovered: regenBetween,
      };

      // hunt 2
      const h2End = toMinutes(hunt2End);
      const dur2 = h2End - toMinutes(hunt2Start);
      dayLog.hunt2 = {
        start: staminaMin,
        end: Math.max(0, staminaMin - dur2),
      };
      staminaMin = dayLog.hunt2.end;

      dayLog.end = staminaMin;
      results.push(dayLog);

      now = h2End;
    }

    setDays(results);
  }, [stamina, currentTime, hunt1Start, hunt1End, hunt2Start, hunt2End, useRefill, weekly]);

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex items-center justify-center p-4">
      <div className="bg-neutral-800 p-6 rounded-2xl shadow-xl w-full max-w-xl space-y-4">
        <h1 className="text-2xl font-bold text-center">Stamina Rubinot</h1>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Stamina atual (HH:MM)</label>
            <input className="p-2 rounded bg-neutral-700" value={stamina} onChange={(e) => setStamina(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-neutral-400">Horário atual</label>
            <input className="p-2 rounded bg-neutral-700" value={currentTime} onChange={(e) => setCurrentTime(e.target.value)} />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-1">Primeira hunt</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Início</label>
              <input className="p-2 rounded bg-neutral-700" value={hunt1Start} onChange={(e) => setHunt1Start(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Fim</label>
              <input className="p-2 rounded bg-neutral-700" value={hunt1End} onChange={(e) => setHunt1End(e.target.value)} />
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-1">Segunda hunt</div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Início</label>
              <input className="p-2 rounded bg-neutral-700" value={hunt2Start} onChange={(e) => setHunt2Start(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-400">Fim</label>
              <input className="p-2 rounded bg-neutral-700" value={hunt2End} onChange={(e) => setHunt2End(e.target.value)} />
            </div>
          </div>
        </div>

        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={useRefill} onChange={(e) => setUseRefill(e.target.checked)} />
          Aceitar uso de stamina refill (+1h)
        </label>

        <label className="flex gap-2 text-sm">
          <input type="checkbox" checked={weekly} onChange={(e) => setWeekly(e.target.checked)} />
          Modo semanal (5 dias)
        </label>

        <hr className="opacity-20" />

        <div className="space-y-4 text-sm">
          {days.map((d) => (
            <div key={d.day} className="bg-neutral-900 p-3 rounded-lg">
              <div className="font-bold">Dia {d.day}</div>
              <div>Stamina inicial: {format(d.start)}</div>
              <div>⏳ Descanso Noite: {format(d.nightRest.from % 1440)} → {format(d.nightRest.to % 1440)} · {format(d.nightRest.duration)} · 🔄 {format(d.nightRest.recovered)}</div>
              <div>Hunt 1: {format(d.hunt1.start)} → {format(d.hunt1.end)}</div>
              <div>⏳ Descanso entre hunts: {format(d.betweenRest.from % 1440)} → {format(d.betweenRest.to % 1440)} · {format(d.betweenRest.duration)} · 🔄 {format(d.betweenRest.recovered)}</div>
              <div>Hunt 2: {format(d.hunt2.start)} → {format(d.hunt2.end)}</div>
              <div className="font-semibold">Stamina final: {format(d.end)}</div>
              {d.refillUsed && <div className="text-yellow-400">⚡ Refill usado</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
