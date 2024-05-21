const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
// app.use(cors({ origin: "https://community-eats.vercel.app", credentials: true }));
app.use(express.json());

// MongoDB Connection URL
const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    // Connect to MongoDB
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("butchersBasket");
    const collection = db.collection("users");

    // User Registration
    app.post("/register", async (req, res) => {
      const { name, email, password } = req.body;

      // Check if email already exists
      const existingUser = await collection.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "User already exists",
        });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into the database
      await collection.insertOne({ name, email, password: hashedPassword });

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    });

    // User Login
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;

      // Find user by email
      const user = await collection.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Compare hashed password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Generate JWT token
      const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, {
        expiresIn: process.env.EXPIRES_IN,
      });

      res.json({
        success: true,
        message: "Login successful",
        token,
      });
    });

    // ==============================================================
    // WRITE YOUR CODE HERE
    // ==============================================================

    // POST product
    app.post("/product", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const productCollection = db.collection("allProducts");

        const { imageLink, title, category, price, description, rating } = req.body;

        console.log(req.body); 

        if (!imageLink || !title || !category || !price || !description || !rating) {
          return res
            .status(400)
            .json({ message: "Not enough data to create product" });
        }

        await productCollection.insertOne({
          imageLink,
          category,
          title,
          price,
          description,
          rating
        });

        res.status(201).json({
          success: true,
          message: "product added successfully",
        });
      } catch (error) {
        console.error("Error adding product details:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // GET All product
    app.get("/product", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const productCollection = db.collection("allProducts");

        const product = await productCollection.find(req.query).toArray();
        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // GET Single Supplies
    app.get("/product/:id", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const productCollection = db.collection("allProducts");

        const productId = req.params.id;

        const idToFind = new ObjectId(productId);

        // Find the product by its ID
        const product = await productCollection.findOne({ _id: idToFind });

        if (!product) {
          return res.status(404).json({ message: "product not found" });
        }

        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    // POST flash-sale
    app.post("/flash-sale", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const productCollection = db.collection("flashSale");

        const { imageLink, title, category, price, description, rating } = req.body;

        if (!imageLink || !title || !category || !price || !description) {
          return res
            .status(400)
            .json({ message: "Not enough data to create flashSale" });
        }

        await productCollection.insertOne({
          imageLink,
          category,
          title,
          price,
          description,
          rating
        });

        res.status(201).json({
          success: true,
          message: "flashSale added successfully",
        });
      } catch (error) {
        console.error("Error adding flashSale details:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    

    // GET All flash-sale
    app.get("/flash-sale", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const flashSaleCollection = db.collection("flashSale");

        const product = await flashSaleCollection.find().toArray();

        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });
    app.get("/flash-sale/:id", async (req, res) => {
      try {
        const db = client.db("butchersBasket");
        const productCollection = db.collection("flashSale");

        const productId = req.params.id;

        const idToFind = new ObjectId(productId);

        // Find the product by its ID
        const product = await productCollection.findOne({ _id: idToFind });

        if (!product) {
          return res.status(404).json({ message: "product not found" });
        }

        res.json(product);
      } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Internal server error" });
      }
    });

    

    // // Update Single Supplies
    // app.patch("/product/:id", async (req, res) => {
    //   try {
    //     const db = client.db("butchersBasket");
    //     const suppliesCollection = db.collection("allSupplies");

    //     const suppliesId = req.params.id;

    //     const idToUpdate = new ObjectId(suppliesId);

    //     // Check if the supplies exists
    //     const existingSupplies = await suppliesCollection.findOne({
    //       _id: idToUpdate,
    //     });1
    //     if (!existingSupplies) {
    //       return res.status(404).json({ message: "supplies not found" });
    //     }
    //     // Update the supplies with new data from the request body
    //     const { imageLink, title, category, price, description } = req.body;
    //     const updateSupplies = {
    //       imageLink,
    //       title,
    //       category,
    //       price,
    //       description,
    //     };
    //     await suppliesCollection.updateOne(
    //       { _id: idToUpdate },
    //       { $set: updateSupplies }
    //     );
    //     res.json({ success: true, message: "supplies updated successfully" });
    //   } catch (error) {
    //     console.error("Error updating supplies:", error);
    //     res.status(500).json({ message: "Internal server error" });
    //   }
    // });

    // // DELETE supplies
    // app.delete("/product/:id", async (req, res) => {
    //   try {
    //     const db = client.db("butchersBasket");
    //     const suppliesCollection = db.collection("allSupplies");

    //     const suppliesId = req.params.id;

    //     const idToDelete = new ObjectId(suppliesId);

    //     // Check if the Supplies exists
    //     const Supplies = await suppliesCollection.findOne({ _id: idToDelete });

    //     if (!Supplies) {
    //       return res.status(404).json({ message: "Supplies not found" });
    //     }

    //     // Delete the Supplies
    //     await suppliesCollection.deleteOne({ _id: idToDelete });

    //     res.json({ success: true, message: "Supplies deleted successfully" });
    //   } catch (error) {
    //     console.error("Error deleting Supplies:", error);
    //     res.status(500).json({ message: "Internal server error" });
    //   }
    // });

    // Start the server
    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } finally {
  }
}

run().catch(console.dir);

// Test route
app.get("/", (req, res) => {
  const serverStatus = {
    message: "Server is running smoothly",
    timestamp: new Date(),
  };
  res.json(serverStatus);
});
