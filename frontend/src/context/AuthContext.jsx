import { createContext, useContext,useEffect,useState } from "react";
import api, { setAccessToken as setApiAccessToken } from "../services/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
const [loading, setLoading] = useState(true);

  const login = (userData, token) => {
  setUser(userData);
  setAccessToken(token);
  setApiAccessToken(token);
};

  const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch (error) {
    console.error("Logout failed:", error);
  } finally {
    setUser(null);
    setAccessToken(null);
    setApiAccessToken(null);
  }
};
  useEffect(() => {
  const restoreSession = async () => {
    try {
      const response = await api.post("/auth/refresh");

      const newAccessToken = response.data.accessToken;

setAccessToken(newAccessToken);
setApiAccessToken(newAccessToken);

      // Fetch the logged-in user's information
      const userResponse = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${response.data.accessToken}`,
        },
      });

      setUser(userResponse.data.user);
    } catch (error) {
      console.log("No active session");
      setUser(null);
      setAccessToken(null);
      setApiAccessToken(null);
    } finally {
      setLoading(false);
    }
  };

  restoreSession();
}, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        login,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
