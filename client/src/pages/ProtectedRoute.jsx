import React, { useEffect, useState } from 'react';
import { useUser } from '../utils/Providers';
import { Navigate } from 'react-router-dom';
import db from '../db/Dexiedb';

const ProtectedRoute = ({ children }) => {
  const { accessToken, setAccessToken, setUsrId, setUsrName, setUsrEmail, setUsrType } = useUser();
  const [loading, setLoading] = useState(true); // wait for hydration
  const [allow, setAllow] = useState(false);

  useEffect(() => {
    const hydrateContext = async () => {
      try {
        // Get token info
        const tokenData = await db.tn.toCollection().first();
        const userData = await db.ur.toCollection().first();

        if (tokenData?.at && userData) {
          setAccessToken(tokenData.at);
          setUsrType(tokenData.ut);

          setUsrId(userData._i);
          setUsrName(userData.n);
          setUsrEmail(userData.e);

          setAllow(true);
        }
      } catch (err) {
        console.error("Hydration failed:", err);
      } finally {
        setLoading(false);
      }
    };

    hydrateContext();
  }, []);

  if (loading) return null; // or a spinner
  return allow ? children : <Navigate to="/auth/login" replace />;
};

export default ProtectedRoute;
