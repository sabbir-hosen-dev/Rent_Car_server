const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

require('dotenv').config();

const port = process.env.PORT || 8000;

const app = express();
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://rent-car-881ec.web.app',
      'https://rent-car-881ec.firebaseapp.com',
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

const dbName = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const secrectKey = process.env.SECRECT_KEY;

const uri = `mongodb+srv://${dbName}:${dbPass}@rent-car.teggp.mongodb.net/?retryWrites=true&w=majority&appName=Rent-Car`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

//jwt verify

const verifyJWT = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, secrectKey, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    req.user = decoded;
    next();
  });
};

async function run() {
  try {
    const carCollection = client.db('Rent-Car').collection('Cars');
    const bookingCollection = client.db('Rent-Car').collection('Booking');
    const reCollection = client.db('Rent-Car').collection('Booking');

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
    };
    //app jwt token
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, secrectKey, { expiresIn: '1h' });

        res.cookie('token', token, cookieOptions);

        res.status(200).send({ message: 'jwt issued and cookie set' });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error generating JWT token' });
      }
    });

    //logout
    app.post('/logout', (req, res) => {
      res
        .clearCookie('token', cookieOptions)
        .status(200)
        .json({ success: true, message: 'Logged out successfully' });
    });

    // Add new car
    app.post('/add-car', async (req, res) => {
      try {
        const data = req.body;
        const result = await carCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error adding car' });
      }
    });

    // Get all cars
    app.get('/cars', async (req, res) => {
      try {
        const result = await carCollection.find().toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error fetching cars' });
      }
    });

    // Get cars with pagination
    app.get('/cars/page', async (req, res) => {
      const { page = 1, limit = 12 } = req.query;

      // Convert page and limit to integers
      const pageInt = parseInt(page, 10);
      const limitInt = parseInt(limit, 10);

      try {
        // Get the total number of cars in the collection
        const totalItems = await carCollection.countDocuments();

        // Fetch cars for the current page, with the specified limit
        const cars = await carCollection
          .find()
          .skip((pageInt - 1) * limitInt) // Skip previous pages
          .limit(limitInt) // Limit the number of records to the page size
          .toArray();

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalItems / limitInt);

        // Send the response with pagination data
        res.json({
          items: cars,
          totalItems,
          totalPages,
          currentPage: pageInt,
        });
      } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to fetch cars' });
      }
    });

    // Get one car by id
    app.get('/cars/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const find = { _id: new ObjectId(id) };
        const result = await carCollection.findOne(find);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error fetching car by id' });
      }
    });

    // Delete car by id
    app.delete('/cars/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const find = { _id: new ObjectId(id) };
        const result = await carCollection.deleteOne(find);
        res.send({ message: 'Car deleted' });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error deleting car' });
      }
    });

    // Update car by id
    app.patch('/cars/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const data = req.body;
        const filter = { _id: new ObjectId(id) };
        const update = { $set: data };
        const result = await carCollection.updateOne(filter, update);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error updating car' });
      }
    });

    // Get cars by user email
    app.get('/my-cars/:email', verifyJWT, async (req, res) => {
      const email = req.params.email;

      if (email !== req.user.email) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      try {
        const find = { 'owner.email': email };
        const result = await carCollection.find(find).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error fetching user cars' });
      }
    });

    // get latest bookings car  data
    app.get('/latest', async (req, res) => {
      try {
        const result = await carCollection
          .find({})
          .sort({ postDate: -1 })
          .limit(6)
          .toArray();
        res.send(result);
      } catch (error) {
        console.error(err);
        res.status(500).send({ message: 'latest car not fetching' });
      }
    });

    // all boolings
    app.get('/bookings', async (req, res) => {
      try {
        const result = await bookingCollection.find().toArray();

        res.send(result);
      } catch (error) {
        console.error(err);
        res.status(500).send({ message: 'bookings not fetching' });
      }
    });

    // Booking car
    app.post('/bookings', verifyJWT, async (req, res) => {
      try {
        const data = req.body;
        const result = await bookingCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error booking car' });
      }
    });

    // my bookings data by email
    app.get('/my-bookings/:email', verifyJWT, async (req, res) => {
      try {
        const email = req.params.email;

        if (email !== req.user.email) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        const find = { 'hirer.email': email };
        const result = await bookingCollection.find(find).toArray();
        res.send(result);
      } catch (error) {
        console.error(err);
        res.status(500).send({ message: err.message });
      }
    });

    // delete boking data
    app.delete('/bookings/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const result = await bookingCollection.deleteOne(filter);
        res.send(result);
      } catch (error) {
        console.error(err);
        res.status(500).send({ message: err.message });
      }
    });

    // put bookin date
    app.put('/bookings/:id', verifyJWT, async (req, res) => {
      const id = req.params.id;
      const data = req.body;

      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: {
          bookingDate: new Date(data.bookingDate),
          endDate: new Date(data.endDate),
        },
      };

      try {
        // Perform the update in the database
        const result = await bookingCollection.updateOne(filter, update);

        if (result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ error: 'Booking not found or no changes made' });
        }

        return res
          .status(200)
          .json({ message: 'Booking updated successfully' });
      } catch (error) {
        console.error('Error updating booking:', error);
        return res.status(500).json({ error: 'Failed to update booking' });
      }
    });

    //booking request get
    app.get('/booking/request', verifyJWT, async (req, res) => {
      try {
        const email = req.query.email;

        const filter = { 'owner.email': email };
        const result = await bookingCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error updating booking:', error);
        return res
          .status(500)
          .json({ error: 'Failed to bookings request Data' });
      }
    });

    //booking panding data get
    app.get('/booking/request/status', verifyJWT, async (req, res) => {
      try {
        const email = req.query.email;

        if (email !== req.user.email) {
          return res.status(403).json({ message: 'Unauthorized' });
        }
        const status = req.query.status;

        const filter = { 'owner.email': email, bookingStatus: status };
        const result = await bookingCollection.find(filter).toArray();
        res.send(result);
      } catch (error) {
        console.error('Error updating booking:', error);
        return res
          .status(500)
          .json({ error: 'Failed to bookings request Data' });
      }
    });

    //status Update
    app.patch('/booking/:id', verifyJWT, async (req, res) => {
      try {
        const id = req.params.id;
        const status = req.query.status;
        const carQuery = { _id: new ObjectId(req.query.carId) };

        let avaliableValue = false;

        if (status === 'Canceled' || status === 'Pending') {
          avaliableValue = true;
        }
        if (status === 'Confirmed') {
          avaliableValue = false;
        }

        const updateCarAvilaty = {
          $set: {
            avalilable: avaliableValue,
          },
          ...(status === 'Confirmed' && { $inc: { bookingCount: 1 } }),
        };

        // Update the car collection based on the carQuery
        const carUpdateResult = await carCollection.updateOne(
          carQuery,
          updateCarAvilaty
        );

        // Update the booking status in the booking collection
        const filter = { _id: new ObjectId(id) };
        const update = {
          $set: {
            bookingStatus: status,
          },
        };

        const bookingUpdateResult = await bookingCollection.updateOne(
          filter,
          update
        );

        res.send({ carUpdateResult, bookingUpdateResult });
      } catch (error) {
        console.error('Error updating booking:', error);
        return res
          .status(500)
          .json({ error: 'Failed to update booking status' });
      }
    });

    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // // Send a ping to confirm a successful connection
    // await client.db('admin').command({ ping: 1 });
    // console.log(
    //   'Pinged your deployment. You successfully connected to MongoDB!'
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.options('*', cors());

app.get('/', (req, res) => {
  res.send(`Car rent Server Running`);
});

app.listen(port, () => {
  console.log('app running at ', port);
});
