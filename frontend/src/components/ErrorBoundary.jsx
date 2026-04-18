import React from 'react';
import { AlertOctagon } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, errorInfo: error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="bloomberg-panel p-8 max-w-xl text-center border-negative/50">
             <AlertOctagon className="w-16 h-16 text-negative mx-auto mb-4" />
             <h1 className="text-2xl font-bold font-mono text-white mb-2">SYSTEM FAULT DETECTED</h1>
             <p className="text-textMuted mb-6 text-sm">{this.state.errorInfo?.toString() || "A critical UI rendering failure occurred."}</p>
             <button 
                onClick={() => window.location.href = '/'}
                className="neon-button border-negative/50 text-negative hover:bg-negative"
             >
               RESET PROTOCOL & RETURN HOME
             </button>
          </div>
        </div>
      );
    }
    return this.props.children; 
  }
}

export default ErrorBoundary;
