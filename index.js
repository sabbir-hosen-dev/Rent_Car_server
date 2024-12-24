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
    origin: 'http://localhost:5173',
    credentials: true,
    // sameSite: "strict",
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

async function run() {
  try {
    const carCollection = client.db('Rent-Car').collection('Cars');
    const bookingCollection = client.db('Rent-Car').collection('Booking');

    //app jwt token
    app.post('/jwt', async (req, res) => {
      try {
        const user = req.body;
        const token = jwt.sign(user, secrectKey, { expiresIn: '1h' });

        res.cookie('token', token, {
          httpOnly: true,
          secure: false,
          //  sameSite: "lax"
        });

        res.status(200).send({ message: 'jwt issued and cookie set' });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error generating JWT token' });
      }
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
    app.get('/my-cars/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const find = { 'owner.email': email };
        const result = await carCollection.find(find).toArray();
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error fetching user cars' });
      }
    });

    // Booking car
    app.post('/bookings', async (req, res) => {
      try {
        const data = req.body;
        const result = await bookingCollection.insertOne(data);
        res.send({ message: 'Booking added' });
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: 'Error booking car' });
      }
    });

    // my bookings data by email
    app.get('/my-bookings/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const find = { 'bayer.email': email };
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
        res.send({ message: 'Deleted' });
      } catch (error) {
        console.error(err);
        res.status(500).send({ message: err.message });
      }
    });

    // put bookin date
    app.put('/bookings/:id', async (req, res) => {
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

app.get('/', (req, res) => {
  res.send(`Car rent Server Running`);
});

app.listen(port, () => {
  console.log('app running at ', port);
});
