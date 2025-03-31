import {supabase} from "@/lib/supabase"

export async function getAllProducts() {
    return await supabase
        .from("products")
        .select("*");
        
}

export async function getProductByShop(shop_id : string) {
    return await supabase
        .from("products")
        .select("*")
        .eq("shop_id", shop_id);
}

export async function getProductByName(name : string) {
    return await supabase
        .from("products")
        .select("*")
        .eq("name", name);
}

export async function getProductRangeByPrice(minPrice : number, maxPrice : number) {
    return await supabase
        .from("products")
        .select("*")
        .gte("minPrice", minPrice)
        .lte("maxPrice", maxPrice);
}

// export async function getProductRangeByTag( ) {
//     return await supabase
//         .from("products")
//         .select("*")
//         .eq("shop_id", shop_id);
// }

// export async function getProductRangeBySize() {
//     return await supabase
//         .from("products")
//         .select("*")
//         .eq("shop_id", shop_id);
// }
