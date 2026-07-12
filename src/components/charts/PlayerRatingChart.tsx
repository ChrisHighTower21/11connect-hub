"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler
);

type Match = {
  date: string;
  rating: number;
};

type Props = {
  matches: Match[];
};

export function PlayerRatingChart({ matches }: Props) {
  if (matches.length === 0) {
    return <p className="page-description">Noch keine Daten vorhanden.</p>;
  }

  return (
    <div style={{ height: 320 }}>
      <Line
        data={{
          labels: matches.map((match) => match.date),
          datasets: [
  {
    label: "Bewertung",
    data: matches.map((m) => m.rating),

    borderColor: "#38bdf8",
    backgroundColor: "rgba(56,189,248,0.18)",

    fill: true,

    borderWidth: 4,

    pointRadius: 6,
    pointHoverRadius: 9,

    pointBackgroundColor: "#38bdf8",
    pointBorderColor: "#ffffff",
    pointBorderWidth: 2,

    tension: 0.35,
  },
],
        }}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
            tooltip: {
              callbacks: {
                label: (context) => `Bewertung: ${context.parsed.y}`,
              },
            },
          },
          scales: {
            y: {
              min: 0,
              max: 10,
              ticks: {
                stepSize: 1,
              },
            },
          },
        }}
      />
    </div>
  );
}