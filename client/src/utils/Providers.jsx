// UserContext.js
import { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export function UserProvider({ children }) {
  const [usrId, setUsrId] = useState();
  const [usrName, setUsrName] = useState(); 
  const [usrEmail, setUsrEmail] = useState();
  const [accessToken, setAccessToken] = useState();
  const [usrType, setUsrType] = useState();

  return (
    <UserContext.Provider value={{usrId, setUsrId, usrName, setUsrName, usrEmail, setUsrEmail, accessToken, setAccessToken, usrType, setUsrType }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}


