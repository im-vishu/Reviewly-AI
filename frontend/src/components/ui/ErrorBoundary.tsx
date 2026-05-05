import { Component, ReactNode } from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error('Error caught by boundary:', error);
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-[400px] p-6">
            <div className="text-center max-w-md">
              <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-white mb-2">Something went wrong</h2>
              <p className="text-sm text-gray-400 mb-6">{this.state.error?.message || 'An unexpected error occurred'}</p>
              <button
                onClick={this.reset}
                className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-black font-medium px-4 py-2 rounded-lg"
              >
                <RotateCcw size={16} />
                Try again
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
