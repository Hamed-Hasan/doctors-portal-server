const { ObjectId } = require("mongodb");
const { getDb } = require("../utils/dbConnect");

module.exports.getAllService = async (req, res, next) => {
    try {
        const db = getDb();
        const query = {};
        const cursor = db.collection("services").find(query).project({name: 1});
        const services = await cursor.toArray();
        res.status(200).json({    
            success: true,
            data: services
        })

    } catch (error) {
        next(error);
    }
}
module.exports.getAllReviews = async (req, res, next) => {
    try {
        const db = getDb();
        const query = {};
        const review = await db.collection("review").find(query).toArray();
        
        res.status(200).json({    
            success: true,
            data: review
        })

    } catch (error) {
        next(error);
    }
}
