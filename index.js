const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const { ObjectID } = require('bson');
require('dotenv').config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lgdlxzl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri)

async function run() {
    try {

        const serviceCollection = client.db('dcp-edm').collection('services');
        const reviewCollection = client.db('dcp-edm').collection('reviews');
        app.get('/services', async (req, res) => {

            const query = {}
            const cursor = serviceCollection.find(query);
            let size = await serviceCollection.estimatedDocumentCount();
            if (req.query.size) {
                size = parseInt(req.query.size);
            }
            // console.log(size)
            const result = await cursor.limit(size).toArray();
            res.send(result);

        })
        app.get('/services/:id', async (req, res) => {

            const query = { _id: ObjectId(req.params.id) }
            console.log(query)
            const result = await serviceCollection.findOne(query);
            res.send(result);
        })
        app.get('/review/:id', async (req, res) => {

            const query = { serviceId: req.params.id }

            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })
        app.get('/myreview', async (req, res) => {

            const query = { email: req.query.email }
            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })


        app.post('/review', async (req, res) => {
            const review = req.body;
            review.date = new Date(Date.now()).toISOString();
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.send(result);
            // console.log(review);
        })
        app.delete(`/review/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            // console.log(query);
            const result = await reviewCollection.deleteOne(query)
            res.send(result)
        })

    }
    finally {

    }
}
run().catch(err => console.log(err))



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})