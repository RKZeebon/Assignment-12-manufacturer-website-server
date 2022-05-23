const express = require('express')
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.qlrfj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


function verifyJwt(req, res, next) {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ message: "Unauthorized Access" })
    }
    jwt.verify(authorization, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: "Forbidden Access" })
        }
        req.decoded = decoded;
        next()
    });

}


async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('masonTools').collection('tools')
        const ordersCollection = client.db('masonTools').collection('orders')
        const reviewsCollection = client.db('masonTools').collection('reviews')
        const usersCollection = client.db('masonTools').collection('users')

        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray()

            res.send(tools)
        })

        app.get('/tool/:id', async (req, res) => {
            const id = req.params.id;
            const q = { _id: ObjectId(id) }
            const tool = await toolsCollection.findOne(q)
            res.send(tool)
        })

        app.post('/orders', async (req, res) => {
            const doc = req.body
            const result = await ordersCollection.insertOne(doc)
            res.send(result)
        })
        app.get('/myorders', verifyJwt, async (req, res) => {
            const email = req.query.email
            const decodedmail = req.decoded.email
            if (email === decodedmail) {
                const q = { email }
                const result = await ordersCollection.find(q).toArray()
                res.send(result)
            }
            else {
                return res.status(403).send({ message: "Forbidden Access" })
            }

        })

        app.get('/myorder/:id', async (req, res) => {
            const id = req.params.id
            const q = { _id: ObjectId(id) }
            const result = await ordersCollection.findOne(q)
            res.send(result)
        })

        app.delete('/myorder/:id', async (req, res) => {
            const id = req.params.id
            const q = { _id: ObjectId(id) }
            const result = await ordersCollection.deleteOne(q)
            res.send(result)
        })

        app.get('/reviews', async (req, res) => {
            const tools = await reviewsCollection.find().toArray()

            res.send(tools)
        })
        app.post('/review', async (req, res) => {
            const doc = req.body
            const result = await reviewsCollection.insertOne(doc)
            res.send(result)
        })

        app.put('/user/:email', async (req, res) => {
            const email = req.params.email
            const user = req.body;
            const filter = { email }
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            };
            const result = await usersCollection.updateOne(filter, updateDoc, options)
            const token = jwt.sign({ email }, process.env.ACCESS_TOKEN);
            res.send({ result, token })
        })

        app.get('/user', async (req, res) => {
            const email = req.query.email
            const q = { email }
            const result = await usersCollection.findOne(q)

            res.send(result)

        })

        app.put('/user', async (req, res) => {
            const email = req.query.email
            const q = { email }
            const userData = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: userData,
            };
            const result = await usersCollection.updateOne(q, updateDoc, options)
            res.send(result)

        })





    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', async (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Server is running at port ${port}`)
})