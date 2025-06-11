import api from "./Axios";
import { useUser } from "./Providers";

export const RefreshAccessToken = async() => {
    try
    {
        const {setAccessToken} = useUser();

        const response = await api.post('/auth/Refresh');  
        const firstRecord = await db.tn.toCollection().first();

        if (firstRecord) {
            await db.tn.update(firstRecord.at, { at: response.headers['x-access-token'] });
            setAccessToken(response.headers['x-access-token']);
            return true;
        }
        return null;
    }
    catch(err)
    {
        console.error(err);
        return false;
    }
};
