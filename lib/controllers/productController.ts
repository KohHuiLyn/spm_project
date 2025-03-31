import { 
    getAllProducts, 
    getProductByShop, 
    getProductByName, 
    getProductRangeByPrice
} from '@/lib/models/productModel';

export async function viewShopProducts({shop_id}: {
    shop_id : string;
}) {
    try {
        const { data,  error } = await getProductByShop(shop_id);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error : any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
export async function viewAllProducts() {
    try {
        const { data,  error } = await getAllProducts();
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error : any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
export async function findProductByName({shop_name}: {shop_name : string}) {
    try {
        const { data,  error } = await getProductByName(shop_name);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error : any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}

export async function findProductsByPrice({minPrice, maxPrice}: {
    minPrice : number;
    maxPrice : number;
}) {
    try {
        const { data,  error } = await getProductRangeByPrice(minPrice, maxPrice);
        if (error) throw new Error(error.message);
        return new Response(JSON.stringify(data), { status: 200 });
    } catch (error : any) {
        return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
}
// export const productController = {
//   async getAllProducts(req, res) {
//     try {
//       const products = await productModel.getAllProducts();
//       res.status(200).json(products);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async getProductByID(req, res) {
//     try {
//       const { id } = req.params;
//       const product = await productModel.getProductByID(id);
//       if (!product) {
//         res.status(404).json({ message: 'Product not found' });
//       } else {
//         res.status(200).json(product);
//       }
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async createProduct(req, res) {
//     try {
//       const { name, price, quantity } = req.body;
//       const newProduct = await productModel.createProduct({ name, price, quantity });
//       res.status(201).json(newProduct);
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async updateProductQuantityByID(req, res) {
//     try {
//       const { id } = req.params;
//       const { quantity } = req.body;
//       const updatedProduct = await productModel.updateProductQuantityByID(id, quantity);
//       if (!updatedProduct.length) {
//         res.status(404).json({ message: 'Product not found' });
//       } else {
//         res.status(200).json(updatedProduct);
//       }
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },

//   async deleteProductByID(req, res) {
//     try {
//       const { id } = req.params;
//       const deletedProduct = await productModel.deleteProductByID(id);
//       if (!deletedProduct.length) {
//         res.status(404).json({ message: 'Product not found' });
//       } else {
//         res.status(200).json({ message: 'Product deleted successfully' });
//       }
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   },
// };
