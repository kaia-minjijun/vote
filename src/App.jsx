import React from 'react';
import { LandingPage } from './pages/LandingPage';
import { DisplayPage } from './pages/DisplayPage';
import { VotePage } from './pages/VotePage';

function getPage() {
  const path = window.location.pathname;
  if (path.startsWith('/display')) return 'display';
  if (path.startsWith('/vote')) return 'vote';
  return 'landing';
}

export default function App() {
  const page = getPage();

  if (page === 'display') return <DisplayPage />;
  if (page === 'vote') return <VotePage />;
  return <LandingPage />;
}
