const express = require('express')
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');
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

        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray()

            res.send(tools)
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