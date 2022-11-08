const express = require('express')
const app = express()
const port = 5000
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.json())




const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lgdlxzl.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(uri)

async function run() {
    try {

        const serviceCollection = client.db('dcp-edm').collection('services');
        app.get('/services', async (req, res) => {

            const query = {}
            const cursor = serviceCollection.find(query);
            let size = await serviceCollection.estimatedDocumentCount();
            if (req.query.size) {
                size = parseInt(req.query.size);
            }
            console.log(size)
            const result = await cursor.limit(size).toArray();
            res.send(result);
            // console.log(result)
        })
    }
    finally {

    }
}
run().catch(err => console.log(err))



app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})