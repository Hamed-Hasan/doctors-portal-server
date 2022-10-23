const { getDb } = require('../utils/dbConnect')

const verifyAdmin = async (req, res, next) => {
    const db = getDb();

    const requester = req.decoded.email;
    const requesterAccount = await db.collection("user").findOne({ email: requester });
    if (requesterAccount.role === 'admin') {
      next();
    }
    else {
      res.status(403).send({ message: 'forbidden' });
    }
  }

  module.exports = verifyAdmin;