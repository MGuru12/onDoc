import { useState } from "react";
import api from "../../utils/Axios";

const Registration = () => {
    const [uName, setUName] = useState('');
    const [email, setEmail] = useState('');
    const [pwd, setPWD] = useState('');
    const [cPWD, setCPWD] = useState('');
    const [oName, setOName] = useState('');

    const register = async(e) => {
        e.preventDefault();

        try
        {
            await api.post('/auth/Register', {uName, email, pwd, oName});
            console.log("Registered successfully");
        }
        catch(err)
        {
            if(err.response.status && err.response.status!==500){
                alert(err.response.data.message)
            }
            else {
                console.error(err);
                alert("Something went wrong");
            }
        }
    };
    
  return (
    <div>
        <div className='flex items-center justify-center min-h-screen'>
            <form className='space-y-4' onSubmit={register}>
                <div>
                    <label>USERNAME:</label>
                    <input type="text" className='border border-gray-300' placeholder='USERNAME' value={uName} onChange={(e)=>setUName(e.target.value)} required />
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
                    <label>CONFIRM PASSWORD</label>
                    <input type="password" className='border border-gray-300' placeholder='CONFIRM PASSWORD' value={cPWD} onChange={(e)=>setCPWD(e.target.value)} required />
                </div>
                <div>
                    <label>ORGANIZATION NAME</label>
                    <input type="text" className='border border-gray-300' placeholder='ORGANIZATION NAME' value={oName} onChange={(e)=>setOName(e.target.value)} required />
                </div>
                <div>
                    <input type="submit" className='bg-green-400' value="Registration" />
                </div>
            </form>
        </div>
    </div>
  )
}

export default Registration