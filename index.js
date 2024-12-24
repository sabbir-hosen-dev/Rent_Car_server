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
    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, secrectKey, { expiresIn: '1h' });

      res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        //  sameSite: "lax"
      });

      res.status(200).send({ message: 'jwt issued and cookie set' });
    });

    // add new car
    app.post('/add-car', async (req, res) => {
      const data = req.body;
      const result = await carCollection.insertOne(data);
      res.send(result);
    });

    //get all Cars
    app.get('/cars', async (req, res) => {
      const result = await carCollection.find().toArray();
      res.send(result);
    });

    //get one car bu id
    app.get('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const result = await carCollection.findOne(find);
      res.send(result);
    });

    // delete car by id
    app.delete('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const find = { _id: new ObjectId(id) };
      const result = await carCollection.deleteOne(find);
      res.send({ message: 'delete' });
    });

    // update data by id

    app.patch('/cars/:id', async (req, res) => {
      const id = req.params.id;
      const data = req.body;


  

      const filter = { _id: new ObjectId(id) };
      const update = {
        $set: data,
      };

      const result = await carCollection.updateOne(filter, update);
      res.send(result);
    });



    // get cars by user email
    app.get('/my-cars/:email', async (req, res) => {
      const email = req.params.email;

      const find = { 'user.email': email };
      const result = await carCollection.find(find).toArray();
      res.send(result);
    });




    // booking car 
    app.post("/bookings", async(req,res) => {
      const data = req.body;
      const result = await bookingCollection.insertOne(data);
      res.send({message : "boock add"})
    })

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
