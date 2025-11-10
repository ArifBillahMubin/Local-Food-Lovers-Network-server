const express = require('express');
const cors = require("cors");
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000;

//foodLoversDB
//q0mUPqpLEMGSnhrC
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.m0fnk2l.mongodb.net/?appName=Cluster0`;

//middleware
app.use(cors());
app.use(express.json());

//client create..
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

app.get('/', (req, res) => {
    res.send('Server is running...')
})

async function run() {
    try {
        await client.connect();

        const db = client.db("food-lovers-db")
        const userCollection = db.collection('users');
        const reviewsCollection = db.collection('reviews')

        //review api call
        app.get('/reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ rating: -1 }).limit(6);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/all-reviews', async (req, res) => {
            const cursor = reviewsCollection.find().sort({ createdAt: -1 })
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/myReviews', async (req, res) => {
            const email = req.query.email;
            const query = {};
            query.email = email;
            const causer = reviewsCollection.find(query).sort({ createdAt: 1 });
            const result = await causer.toArray();
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const newReview = req.body;
            const result = await reviewsCollection.insertOne(newReview);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await reviewsCollection.deleteOne(query);
            res.send(result);
        })

        //user all api...
        app.post('/user', async (req, res) => {
            const newUser = req.body;
            const email = req.body.email;
            const query = { email: email };
            const existingUser = await userCollection.findOne(query);
            if (existingUser) {
                res.send({ message: "User already exist , do not insert again.." })
            } else {
                const result = await userCollection.insertOne(newUser);
                res.send(result);
            }
        })

        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir)

app.listen(port, () => {
    console.log(`server listening on port ${port}`)
})
