const API_URL = "/api";

export const fetchApi = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");
  
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes("/auth/login") && typeof window !== "undefined") {
      // Token is stale or invalid on protected routes
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=true";
      }
    }

    const errorData = await response.json().catch(() => ({}));
    const message =
      errorData.error ||
      errorData.message ||
      (response.status === 401
        ? "Session expirée ou identifiants incorrects."
        : response.status === 404
        ? "Ressource introuvable."
        : response.status === 403
        ? "Action réservée à la direction ou administration."
        : `Erreur (${response.status})`);
    throw new Error(message);
  }

  return response.json();
};

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
