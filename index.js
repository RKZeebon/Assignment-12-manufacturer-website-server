const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 5000

app.use(express.json());
app.use(cors());


const uri = `mongodb+srv://${process.env.DB_User}:${process.env.DB_Pass}@cluster0.qlrfj.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });




async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db('masonTools').collection('tools')
        const ordersCollection = client.db('masonTools').collection('orders')

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
        app.get('/myorders', async (req, res) => {
            const email = req.query.email
            const q = { email }
            const result = await ordersCollection.find(q).toArray()
            res.send(result)
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


    } finally {
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