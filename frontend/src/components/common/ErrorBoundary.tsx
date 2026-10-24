import React, { ErrorInfo, ReactNode } from "react";
import { RefreshCw, Home, ShieldAlert } from "lucide-react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("LIAS ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = "/";
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleClearAndReload = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <ShieldAlert className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-rose-600 font-bold px-2 py-0.5 bg-rose-50 border border-rose-200 rounded">
                Incident Interface Détecté
              </span>
              <h1 className="text-xl font-bold text-slate-900">
                Une interruption est survenue
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                La plateforme du Laboratoire LIAS a rencontré une condition imprévue. Les données du laboratoire restent protégées.
              </p>
            </div>

            {this.state.error?.message && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-left text-xs font-mono text-slate-700 break-words max-h-32 overflow-y-auto">
                <span className="text-slate-400 font-semibold block text-[10px] uppercase mb-1">Détail technique :</span>
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={this.handleReload}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Actualiser la page</span>
              </button>

              <button
                onClick={this.handleReset}
                className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-slate-200"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Page d'accueil</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <button
                onClick={this.handleClearAndReload}
                className="text-[11px] text-slate-400 hover:text-slate-600 underline"
              >
                Réinitialiser la session et se reconnecter
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
