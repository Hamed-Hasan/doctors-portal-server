const { ObjectId } = require("mongodb");
const jwt = require('jsonwebtoken');
const { getDb } = require("../utils/dbConnect");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sendAppointmentEmail = require('../middleware/email')
const sendPaymentConfirmationEmail = require('../middleware/sendMail')

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
module.exports.createReview = async (req, res, next) => {
    try {
        const db = getDb();
        const newItem = req.body;
        res.send({result: 'data receive'})
        const result = await db.collection("review").insertOne(newItem);
        console.log('data post database', result.insertedId)

    } catch (error) {
        next(error);
    }
}
module.exports.createBooking = async (req, res, next) => {
    try {
        const db = getDb();
        const booking = req.body;
        const query = { treatment: booking.treatment, date: booking.date, patient: booking.patient }
        const exists = await db.collection("bookings").findOne(query);
        if (exists) {
          return res.send({ success: false, booking: exists })
        }
        const result = await db.collection("bookings").insertOne(booking);
        console.log('sending email');
        sendAppointmentEmail(booking);
        return res.send({ success: true, result });
    } catch (error) {
        next(error);
    }
}
module.exports.createDoctor = async (req, res, next) => {
    try {
        const db = getDb();
        const body = req.body;
        const doctor = await db.collection("doctors").insertOne(body)
        res.send(doctor);
    } catch (error) {
        next(error);
    }
}
module.exports.updatePaymentByMail = async (req, res, next) => {
    try {
        const db = getDb();
        const id  = req.params.id;
        const payment = req.body;
        const filter = {_id: ObjectId(id)};
        const updatedDoc = {
          $set: {
            paid: true,
            transactionId: payment.transactionId
          }
        }
  
        const result = await db.collection("payments").insertOne(payment);
        const updatedBooking = await db.collection("bookings").updateOne(filter, updatedDoc);
        sendPaymentConfirmationEmail(payment)
        res.send(updatedBooking);
    } catch (error) {
        next(error);
    }
}
module.exports.updateCreateAdmin = async (req, res, next) => {
    try {
        const db = getDb();
        const email = req.params.email;
        // admin verify new code
        // const requester = req.decoded.email;
        // const requesterAccount = await userCollection.findOne({ email: requester });
        // if(requesterAccount.role === 'admin') {
           // admin verify conditions old code
          const filter = { email: email };
          const options = { upsert: true };
          const updateDoc = {
            $set: {role: 'admin'},
          };
          const result = await db.collection("user").updateOne(filter, updateDoc, options);
          res.send( result);
        // }else{
        //   res.status(403).send({message: 'forbidden'});
        // }
    } catch (error) {
        next(error);
    }
}
module.exports.updateUserEmail = async (req, res, next) => {
    try {
        const db = getDb();
        const email = req.params.email;
        const user = req.body;
        const filter = { email: email };
        const options = { upsert: true };
        const updateDoc = {
          $set: user,
        };
        const result = await db.collection("user").updateOne(filter, updateDoc, options);
        const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
        res.send({ result, token });
    } catch (error) {
        next(error);
    }
}
module.exports.deleteDoctorByMail = async (req, res, next) => {
    try {
        const db = getDb();
        const email = req.params.email;
        const filter = { email: email };
        const result = await db.collection("doctors").deleteOne(filter)
        res.send(result)
    } catch (error) {
        next(error);
    }
}