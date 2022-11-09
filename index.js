const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
const { ObjectID } = require('bson');
const jwt = require('jsonwebtoken');
require('dotenv').config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lgdlxzl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri)

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized  access' });

    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCES_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden  access' });
        }
        req.decoded = decoded;
        next();
    })
}

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

        app.patch(`/review/:id`, async (req, res) => {
            const id = req.params.id;
            const status = req.body.review;
            console.log(status)
            const query = { _id: ObjectID(id) }
            const updateQuery = {
                $set: {
                    review: status
                }
            }
            const result = await reviewCollection.updateOne(query, updateQuery);
            res.send(result)
            console.log(result)
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
        app.get('/myreview', verifyJWT, async (req, res) => {
            const decoded = req.decoded;
            console.log('inside myreview', decoded);
            if (decoded.email !== req.query.email) {
                return res.status(403).send({ message: 'unauthorized  access' });

            }
            console.log(req.headers.authorization);
            const query = { email: req.query.email }
            const cursor = reviewCollection.find(query).sort({ date: -1 });
            const result = await cursor.toArray();
            // console.log(result);
            res.send(result);
        })
        app.post('/jwt', async (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCES_TOKEN_SECRET, { expiresIn: '1h' })
            res.send({ token });
            // console.log(user);

        })

        app.post('/review', async (req, res) => {
            const review = req.body;
            review.date = new Date(Date.now()).toISOString();
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.send(result);
            // console.log(review);
        })
        app.post('/addservice', async (req, res) => {
            const service = req.body;
            const result = await serviceCollection.insertOne(service);
            res.send(result);
            console.log(result);
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