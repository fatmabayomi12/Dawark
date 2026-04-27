import mongoose from "mongoose";


const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        minLength: [3, "Category name must be at least 3 characters long"],
        maxLength: [50, "Category name must be less than 50 characters long"],
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        trim: true,
    },
    photo_url: String,
    
},{ timestamps: true });

const Category = mongoose.model("Category", categorySchema);

export default Category;