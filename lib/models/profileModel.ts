import {supabase} from "@/lib/supabase"

export async function getUserProfile(userID : string) {
    return await supabase
        .from("profiles")
        .select("*")
        .eq('user_id', userID)
        .single();
}

export async function addNewProfile(
    userID : string, 
    sizeRecos : string[], 
    styleRecos : string[]
) {
    return await supabase
        .from("profiles")
        .insert([{
            user_id: userID, 
            size_recos: JSON.stringify(sizeRecos),
            style_recos: JSON.stringify(styleRecos)
        },])
}