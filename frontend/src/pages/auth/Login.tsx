import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { fetchApi } from "../../lib/api";
import { useLanguage } from "../../context/LanguageContext";
import { Lock, Mail, ShieldAlert, KeyRound, Sparkles } from "lucide-react";

export default function Login() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const data = await fetchApi("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const currentUser = data.user || data;
      const role = (currentUser?.role || "").toUpperCase();

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(currentUser));

      if (role === "DIRECTOR") {
        window.location.href = "/dashboard/director";
      } else if (role === "ADMIN") {
        window.location.href = "/dashboard/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err.message || (lang === "fr" ? "Erreur de connexion" : "Login error"));
    } finally {
      setLoading(false);
    }
  };

  const setTestAccount = (testEmail: string, testPass: string) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        <div className="bg-white p-8 rounded-xl border border-slate-200 shadow-sm space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 bg-blue-100 text-blue-800 rounded-xl flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {lang === "fr" ? "Connexion Espace Membre" : "Laboratory Portal Login"}
            </h2>
            <p className="text-xs text-slate-500">
              {lang === "fr"
                ? "Accès sécurisé réservé aux membres, doctorants et direction du LIAS"
                : "Secure access for LIAS faculty, PhD students and direction"}
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-lg flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                {lang === "fr" ? "Adresse email" : "Email Address"}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="email"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="nom@lias.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-tight mb-1">
                {lang === "fr" ? "Mot de passe" : "Password"}
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="password"
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow"
            >
              {loading ? (lang === "fr" ? "Vérification..." : "Signing in...") : t("nav.login")}
            </button>
          </form>

          {/* Quick Demo Credentials */}
          <div className="pt-4 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-3">
              {lang === "fr" ? "Comptes de test (Cliquer pour remplir)" : "Quick Test Accounts"}
            </p>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setTestAccount("director@lias.com", "director123")}
                className="p-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded border border-blue-200 text-left transition-colors"
              >
                <p className="font-bold text-[11px]">Directeur LIAS</p>
                <p className="text-[10px] text-blue-600 font-mono">director@lias.com</p>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount("admin@lias.com", "admin123")}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded border border-slate-200 text-left transition-colors"
              >
                <p className="font-bold text-[11px]">Administrateur</p>
                <p className="text-[10px] text-slate-500 font-mono">admin@lias.com</p>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount("s.elfilali@lias.com", "member123")}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded border border-slate-200 text-left transition-colors"
              >
                <p className="font-bold text-[11px]">Vice-Directrice</p>
                <p className="text-[10px] text-slate-500 font-mono">s.elfilali@lias.com</p>
              </button>

              <button
                type="button"
                onClick={() => setTestAccount("fz.alaoui@lias.com", "member123")}
                className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-800 rounded border border-slate-200 text-left transition-colors"
              >
                <p className="font-bold text-[11px]">Doctorante LIAS</p>
                <p className="text-[10px] text-slate-500 font-mono">fz.alaoui@lias.com</p>
              </button>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-slate-500">
          {lang === "fr" ? "Pas encore membre du laboratoire ?" : "Not a laboratory member yet?"}{" "}
          <Link to="/apply" className="font-bold text-blue-600 hover:underline">
            {lang === "fr" ? "Déposer une demande d'adhésion" : "Submit a membership application"}
          </Link>
        </div>
      </div>
    </div>
  );
}
