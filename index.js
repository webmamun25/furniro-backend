const express = require('express')
const app = express()
const port =process.env.PORT||7000

var cors = require('cors')
require('dotenv').config()
// const stripe = require("stripe")(process.env.STRIPE_SECRET);


const corsConfig = {
    origin: ['https://furniture-frontend-22.netlify.app'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT','PATCH', 'DELETE']
  }
  app.use(cors(corsConfig))
  app.options( ['https://furniture-frontend-22.netlify.app'], cors(corsConfig))
  

app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.qdiymxl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
console.log(uri)

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const FurnitureDB = client.db("Furniture");
    const FurnitureCollections = FurnitureDB.collection("products");
    const UsersCollections = FurnitureDB.collection("users");
    const CartCollections = FurnitureDB.collection("cart");
    app.get('/', (req, res) => {
        res.send('Hello world!')
      })
      app.get('/products', async(req, res) => {
        const cursor = FurnitureCollections.find();
        const result=await cursor.toArray()
        res.send(result)
        })
       app.get('/users', async(req, res) => {
        const cursor = UsersCollections.find();
        const result=await cursor.toArray()
        res.send(result)
        })
      
      app.get('/cart', async(req, res) => {
        let query={}
        console.log(req.query)
        if(req.query?.email){
          query={'user.email':req.query.email}
        }
        const cursor = CartCollections.find(query).sort({"_id":-1});
        const result=await cursor.toArray()
        res.send(result)
        })
      app.get('/products/:id', async(req, res) => {
        const id=req.params.id 
        const query={_id:new ObjectId(id)}
        const result =await FurnitureCollections.findOne(query);

        res.send(result)
        })
      app.get('/cart/:id', async(req, res) => {
        const id=req.params.id 
        const query={_id:new ObjectId(id)}
        const result =await CartCollections.findOne(query);

        res.send(result)
        })

        app.get('/bookings',async(req, res) => {
         
          
          let query={}
    
          if(req.query?.email){
            query={'user.email':req.query.email}
          }
          const result =await  CartCollections.find(query).toArray();
          res.send(result)
          })

      app.post('/users',async(req,res)=>{
        const users=req.body 
        const result = await UsersCollections.insertOne(users);
      
        res.send(result)
      })
      app.post('/cart',async(req,res)=>{
        const carts=req.body 
        const result = await CartCollections.insertOne(carts);
      
        res.send(result)
      })

      app.post("/create-payment-intent",  async(req, res) => {
        const {price}=req.body 
        console.log(price)
        const amount=parseInt(price*100)
        
        // Create a PaymentIntent with the order amount and currency
        const paymentIntent = await stripe.paymentIntents.create({
          amount: amount,
          currency: "usd",
          // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
          
          payment_method_types: [
            "card"
           
          ],
        });
      
        res.send({
          clientSecret: paymentIntent.client_secret,
        });
      });
      app.patch('/users/:email',async(req,res)=>{
        const email=req.params.email
        const filter={'user.email':email}
      
        const updatedUsers=req.body 
        const updatedDOc={
          $set:{
         
            role:updatedUsers.role
          }
        }
        const result=await UsersCollections.updateOne(filter,updatedDOc)
        res.send(result)
        console.log(updatedUsers)
  
      })
      app.delete('/bookings/:id',async(req,res)=>{
        const id=req.params.id
        const query={_id:new ObjectId(id)}
        const result=await CartCollections.deleteOne(query)
        res.send(result)
      })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

