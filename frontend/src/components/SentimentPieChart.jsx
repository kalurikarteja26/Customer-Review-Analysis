import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentPieChart = ({ reviews = [] }) => {

  // Ensure reviews is always an array
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const counts = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  // Safely calculate sentiment counts
  safeReviews.forEach((r) => {
    const label = r?.sentiment_label;

    if (label && counts[label] !== undefined) {
      counts[label] += 1;
    }
  });

  const data = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          counts.positive,
          counts.neutral,
          counts.negative,
        ],
        backgroundColor: [
          'rgba(34, 197, 94, 0.6)',
          'rgba(148, 163, 184, 0.6)',
          'rgba(239, 68, 68, 0.6)',
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(148, 163, 184)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#94a3b8',
        },
      },
      title: {
        display: true,
        text: 'Sentiment Analysis',
        color: '#94a3b8',
      },
    },
  };

  return (
    <div style={{ background: 'var(--bg-card)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid var(--border)', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '300px', height: '300px' }}>
        <Pie data={data} options={options} />
      </div>
    </div>
  );
};

export default SentimentPieChart;