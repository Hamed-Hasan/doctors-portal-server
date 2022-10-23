const { ObjectId } = require("mongodb");
const { getDb } = require("../utils/dbConnect");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

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
module.exports.getAllUser = async (req, res, next) => {
    try {
        const db = getDb();
        const user = await db.collection("user").find().toArray();

        res.status(200).json({    
            success: true,
            data: user
        })

    } catch (error) {
        next(error);
    }
}
module.exports.getCheckAdmin = async (req, res, next) => {
    try {
        const db = getDb();
        const email = req.params.email;
        const user = await db.collection("user").findOne({email: email});
        const isAdmin = user.role === 'admin';
        res.send({admin: isAdmin})

        res.status(200).json({    
            success: true,
            data: user
        })

    } catch (error) {
        next(error);
    }
}
module.exports.getAvailableAllAppointments = async (req, res, next) => {
    try {
        const db = getDb();
        const date = req.query.date;

      // step 1:  get all services
      const services = await db.collection("services").find().toArray();

      // step 2: get the booking of that day. output: [{}, {}, {}, {}, {}, {}]
      const query = {date: date};
      const bookings = await db.collection("bookings").find(query).toArray();

      // step 3: for each service
      services.forEach(service=>{
        // step 4: find bookings for that service. output: [{}, {}, {}, {}]
        const serviceBookings = bookings.filter(book => book.treatment === service.name);
        // step 5: select slots for the service Bookings: ['', '', '', '']
        const bookedSlots = serviceBookings.map(book => book.slot);
        // step 6: select those slots that are not in bookedSlots
        const available = service.slots.filter(slot => !bookedSlots.includes(slot));
        //step 7: set available to slots to make it easier 
        service.slots = available;
      });

        res.status(200).json({    
            success: true,
            data: services
        })

    } catch (error) {
        next(error);
    }
}
module.exports.getVerifyBooking = async (req, res, next) => {
    try {
        const db = getDb();
        const patient = req.query.patient;
        const decodedEmail = req.decoded.email;
        if (patient === decodedEmail) {
          const query = { patient: patient };
          const bookings = await db.collection("bookings").find(query).toArray();
          return res.send(bookings);
        }
        else {
          return res.status(403).send({ message: 'forbidden access' });
        }
   

    } catch (error) {
        next(error);
    }
}
module.exports.getIdByBooking = async (req, res, next) => {
    try {
        const db = getDb();
        const id = req.params.id;
        const query = {_id: ObjectId(id)};
        const booking = await db.collection("bookings").findOne(query);

        res.status(200).json({    
            success: true,
            data: booking
        })

    } catch (error) {
        next(error);
    }
}
module.exports.getAllDoctors = async (req, res, next) => {
    try {
        const db = getDb();
        const doctors = await db.collection("doctors").find().toArray();

        res.status(200).json({    
            success: true,
            data: doctors
        })

    } catch (error) {
        next(error);
    }
}
module.exports.createPaymentIntent = async (req, res, next) => {
    try {
        const service = req.body;
        const price = service.price;
        const amount = price*100;
        const paymentIntent = await stripe.paymentIntents.create({
          amount : amount,
          currency: 'usd',
          payment_method_types:['card']
        });
        res.send({clientSecret: paymentIntent.client_secret})

    } catch (error) {
        next(error);
    }
}