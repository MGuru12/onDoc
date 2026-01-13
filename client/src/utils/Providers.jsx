import { createContext, useContext, useState, useEffect } from 'react';
import { authStore } from './AuthStore';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usrId, setUsrId] = useState();
  const [usrName, setUsrName] = useState(); 
  const [usrEmail, setUsrEmail] = useState();
  const [accessToken, setAccessToken] = useState();
  const [usrType, setUsrType] = useState();

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
        usrType, setUsrType
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
