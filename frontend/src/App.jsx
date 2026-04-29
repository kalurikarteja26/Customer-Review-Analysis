import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh' }}>
        <Header />
        <Home />
      </div>
    </ThemeProvider>
  );
}

export default App;
