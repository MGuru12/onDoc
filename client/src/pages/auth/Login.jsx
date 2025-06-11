import React, { useState } from 'react'
import api from '../../utils/Axios';
import { useUser } from '../../utils/Providers';
import db from '../../db/Dexiedb';

const Login = () => {
    const [email, setEmail] = useState('');
    const [pwd, setPWD] = useState('');
    const [oName, setOName] = useState('');

    const {setUsrId, setUsrName, setUsrEmail, setAccessToken, setUsrType} = useUser();

    const login = async(e) => {
      e.preventDefault();

      try
      {
        const response = await api.post('/auth/login', {email, pwd, oName});
        const accessToken = response.headers['x-access-token'];

        await Promise.all([
          db.ur.clear(),
          db.tn.clear(),
        ]);
        await db.ur.add(response.data.data);
        await db.tn.add({at: accessToken, ut: response.data.usrType});

        setUsrId(response.data.data._i);
        setUsrName(response.data.data.n);
        setUsrEmail(response.data.data.e);
        setAccessToken(response.data.data.at);
        setUsrType(response.data.usrType);

        console.log("Login Successfull");
        
      }
      catch(err)
      {
        console.error(err);
      }
    };

  return (
    <div>
        <div className='flex items-center justify-center min-h-screen'>
            <form className='space-y-4' onSubmit={login}>
              <div>
                    <label>Organization Name</label>
                    <input type="text" className='border border-gray-300' placeholder='Organization' value={oName} onChange={(e)=>setOName(e.target.value)} required />
                </div>
                <div>
                    <label>EMAIL</label>
                    <input type="email" className='border border-gray-300' placeholder='EMAIL' value={email} onChange={(e)=>setEmail(e.target.value)} required />
                </div>
                <div>
                    <label>PASSWORD</label>
                    <input type="password" className='border border-gray-300' placeholder='PASSWORD' value={pwd} onChange={(e)=>setPWD(e.target.value)} required />
                </div>
                <div>
                    <input type="submit" className='bg-green-400' value="Login" />
                </div>
            </form>
        </div>
    </div>
  )
}

export default Login