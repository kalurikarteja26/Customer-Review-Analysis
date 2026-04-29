import React from 'react';
import { useTheme } from '../context/ThemeContext';

const SunIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" />
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
        <line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" />
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
);

const MoonIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
);

const PaletteIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="13.5" cy="6.5" r="0.5" fill="currentColor" /><circle cx="17.5" cy="10.5" r="0.5" fill="currentColor" />
        <circle cx="8.5" cy="7.5" r="0.5" fill="currentColor" /><circle cx="6.5" cy="12.5" r="0.5" fill="currentColor" />
        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
);

const Header = () => {
    const { theme, setTheme } = useTheme();

    return (
        <header style={{
            position: 'fixed', top: 0, width: '100%', zIndex: 50,
            background: 'var(--header-bg)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--header-border)',
            boxShadow: '0 1px 12px var(--shadow)',
            transition: 'all 0.4s ease'
        }}>
            <div style={{
                maxWidth: '72rem', margin: '0 auto',
                padding: '0.75rem 1.5rem',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
            }}>
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{
                        background: 'linear-gradient(135deg, var(--accent), var(--accent-lt))',
                        padding: '0.5rem', borderRadius: '0.75rem',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 4px 12px var(--accent-glow)'
                    }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                        </svg>
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.1rem', fontWeight: 900, letterSpacing: '-0.02em',
                            color: 'var(--text)', lineHeight: 1, margin: 0
                        }}>
                            Sentix<span style={{ color: 'var(--accent)' }}>-Prime</span>
                        </h1>
                        <p style={{
                            fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.1em',
                            textTransform: 'uppercase', color: 'var(--text-lt)', margin: 0
                        }}>
                            AI Commerce Intelligence
                        </p>
                    </div>
                </div>

                {/* Theme Toggle */}
                <div className="theme-toggle">
                    <button
                        className={`theme-toggle-btn ${theme === 'default' ? 'active' : ''}`}
                        onClick={() => setTheme('default')}
                        title="Default Theme"
                    >
                        <PaletteIcon />
                    </button>
                    <button
                        className={`theme-toggle-btn ${theme === 'light' ? 'active' : ''}`}
                        onClick={() => setTheme('light')}
                        title="Light Theme"
                    >
                        <SunIcon />
                    </button>
                    <button
                        className={`theme-toggle-btn ${theme === 'dark' ? 'active' : ''}`}
                        onClick={() => setTheme('dark')}
                        title="Dark Theme"
                    >
                        <MoonIcon />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
