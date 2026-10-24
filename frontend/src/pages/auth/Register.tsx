import { useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { fetchApi } from "../../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await fetchApi("/auth/register", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      setSuccess(true);
      setTimeout(() => navigate("/login"), 3000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm w-full bg-white p-8 rounded border border-slate-200 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-center text-lg font-bold text-slate-900 uppercase tracking-tight">Apply for Membership</h2>
          <p className="text-center text-[11px] text-slate-500 uppercase tracking-widest mt-1">
            Join the LIAS research community
          </p>
        </div>
        
        {success ? (
          <div className="bg-blue-50 text-blue-800 p-4 rounded border border-blue-200 text-center text-xs font-bold uppercase tracking-wide">
            Registration sent successfully. You will be redirected to the login page.
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && <div className="text-red-500 text-[11px] font-bold bg-red-50 p-2 rounded border border-red-100 uppercase tracking-wide">{error}</div>}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.firstName}
                    onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={formData.lastName}
                    onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">Email address</label>
                <input
                  type="email"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-tight mb-1">Password</label>
                <input
                  type="password"
                  required
                  className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-1.5 px-4 border border-transparent text-xs font-bold rounded text-white bg-slate-900 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-slate-900 disabled:bg-slate-400 uppercase tracking-wider transition-colors shadow-sm mt-2"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            </div>
            
            <div className="text-center text-[11px] font-medium pt-2 border-t border-slate-100 mt-4">
              <span className="text-slate-500">Already a member? </span>
              <Link to="/login" className="font-bold text-blue-600 hover:underline">
                Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
