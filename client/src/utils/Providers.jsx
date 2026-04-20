import { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from './AuthStore';
import db from '../db/Dexiedb';
import { showLoader, hideLoader } from './LoadingService';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usrId, setUsrId] = useState();
  const [usrName, setUsrName] = useState(); 
  const [usrEmail, setUsrEmail] = useState();
  const [accessToken, setAccessToken] = useState();
  const [usrType, setUsrType] = useState();
  const [isHydrating, setIsHydrating] = useState(true);

  // 🔄 Hydrate state from IndexedDB on mount
  useEffect(() => {
    const hydrate = async () => {
      showLoader();
      try {
        const tokenData = await db.tn.toCollection().first();
        const userData = await db.ur.toCollection().first();

        if (tokenData?.at && userData) {
          setAccessToken(tokenData.at);
          setUsrType(tokenData.ut);
          setUsrId(userData._i);
          setUsrName(userData.n);
          setUsrEmail(userData.e);
        }
      } catch (err) {
        console.error("Global hydration failed:", err);
      } finally {
        setIsHydrating(false);
        hideLoader();
      }
    };
    hydrate();
  }, []);

  // 🔔 Listen for global logout events (from Axios interceptor)
  useEffect(() => {
    const handleGlobalLogout = () => logout();
    window.addEventListener('auth-logout', handleGlobalLogout);
    return () => window.removeEventListener('auth-logout', handleGlobalLogout);
  }, []);

  const logout = async (api) => {
    try {
      if (api) {
        await api.post('/auth/logout').catch(() => {});
      }
      await Promise.all([db.ur.clear(), db.tn.clear()]);
      setAccessToken('');
      setUsrName('');
      setUsrEmail('');
      setUsrId('');
      setUsrType('');
    } catch (err) {
      console.error('Logout script failed:', err);
    }
  };


  // 🔑 Sync React state → Axios-safe store
  useEffect(() => {
    if (accessToken) {
      authStore.setAccessToken(accessToken);
    } else {
      authStore.clear();
    }
  }, [accessToken]);

  return (
    <UserContext.Provider
      value={{
        usrId, setUsrId,
        usrName, setUsrName,
        usrEmail, setUsrEmail,
        accessToken, setAccessToken,
        usrType, setUsrType,
        isHydrating,
        logout
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
