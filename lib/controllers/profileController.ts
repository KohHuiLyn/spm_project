import { 
    getUserProfile, 
    addNewProfile
} from '@/lib/models/profileModel';

export async function registerNewUser({user_id, style_recos, size_recos} : {
    user_id : string;
    style_recos : string[];
    size_recos : string[];
}) {
    try {
        const {data, error} = await addNewProfile(user_id, style_recos, size_recos);
    } catch (error : any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function getUserData({ user_id }: { user_id: string }) {
    try {
        const {data, error} = await getUserProfile(user_id);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch(error: any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}