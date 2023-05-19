const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// mongodb

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = "mongodb://0.0.0.0:27017";
// const uri = `mongodb+srv://${process.env.MOOSE_DATA_UI}:${process.env.MOOSE_DATA_UP}@cluster0.25nqiwd.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const productCollections = client.db("mooseDb").collection("products");

    // all data

    app.get("/all-products/:subCategory", async (req, res) => {
      console.log(req.params.subCategory);
      if (
        req.params.subCategory == "star wars" ||
        req.params.subCategory == "Lego Architecture" ||
        req.params.subCategory == "Lego City" ||
        req.params.subCategory == "Lego Cars"
      ) {
        const result = await productCollections
          .find({ subCategory: req.params.subCategory })
          .toArray();
        res.send(result);
      } else {
        const result = await productCollections.find().toArray();
        res.send(result);
      }
    });

    // single item

    app.get("/single-product/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const filter = await productCollections.findOne(query);
      res.send(filter);
    });

    // email query get

    app.get("/user-products", async (req, res) => {
      console.log(req.query.email);
      let query = {};
      if (req.query.email) {
        query = { sellerEmail: req.query.email };
      }
      const result = await productCollections.find(query).toArray();
      res.send(result);
    });

    // post

    app.post("/postProduct", async (req, res) => {
      const body = req.body;
      console.log(body);
      const result = await productCollections.insertOne(body);
      console.log(result);
      res.send(result);
    });

    // update

    app.patch("/update-product/:id", async (req, res) => {
      const id = req.params.id;
      const updatedProductData = req.body;
      console.log(updatedProductData);
      const filter = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {
          ...updatedProductData,
        },
      };
      const result = await productCollections.updateOne(filter, updatedDoc);
      res.send(result);
    });

    // delete

    app.delete("/deleteProduct/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollections.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("The Moose Server Is Running");
});

app.listen(port, () => {
  console.log(`Server is hitting on port : ${port} `);
});
