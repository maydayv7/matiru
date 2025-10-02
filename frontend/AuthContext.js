import { createContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    (async () => {
      const raw = await AsyncStorage.getItem("matiru_session");
      if (raw) {
        try {
          setUser(JSON.parse(raw));
        } catch (e) {
          console.log(e);
        }
      }
    })();
  }, []);

  const login = async (session) => {
    setUser(session);
    await AsyncStorage.setItem("matiru_session", JSON.stringify(session));
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem("matiru_session");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
