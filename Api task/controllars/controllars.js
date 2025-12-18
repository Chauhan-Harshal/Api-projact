import Product from "../models/product.model.js";

// common response helper
const sendResponse = (res, data) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
        return res.status(404).json({ message: "No products found" });
    }
    res.status(200).json(data);
};

// GET all products
export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        sendResponse(res, products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// GET product by ID
export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        sendResponse(res, product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Search (name / brand / category)
export const searchProducts = async (req, res) => {
    try {
        const { productName, brand, category } = req.query;
        const query = {};

        if (productName) query.productName = new RegExp(productName, "i");
        if (brand) query.brand = new RegExp(brand, "i");
        if (category) query.category = new RegExp(category, "i");

        const products = await Product.find(query);
        sendResponse(res, products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Filter by price & rating
export const filterProducts = async (req, res) => {
    try {
        const { min, max, rating } = req.query;
        const query = {};

        if (min || max) {
            query.price = {};
            if (min) query.price.$gte = Number(min);
            if (max) query.price.$lte = Number(max);
        }

        if (rating) query.rating = { $gte: Number(rating) };

        const products = await Product.find(query);
        sendResponse(res, products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Sort & Pagination
export const getProductsWithPagination = async (req, res) => {
    try {
        const { page = 1, limit = 10, order = "asc" } = req.query;
        const skip = (page - 1) * limit;

        const products = await Product.find()
            .sort({ price: order === "desc" ? -1 : 1 })
            .skip(skip)
            .limit(Number(limit));

        const total = await Product.countDocuments();

        res.json({
            products,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: Number(page)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// CREATE product
export const createProduct = async (req, res) => {
    try {
        const { productName, category, brand, price, rating, description } = req.body;

        if (!productName || !category || !brand || price < 0 || rating < 0 || rating > 5) {
            return res.status(400).json({ message: "Invalid input data" });
        }

        const product = await Product.create({
            productName,
            category,
            brand,
            price,
            rating,
            description
        });

        res.status(201).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
