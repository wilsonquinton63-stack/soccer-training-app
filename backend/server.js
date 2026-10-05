require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app = express();
const PORT = 5001;

app.use(cors());
app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI);

async function startServer() {
  await client.connect();

  console.log("Connected to MongoDB!");

  const db = client.db("soccerTraining");
  const tasksCollection = db.collection("tasks");

  // View all tasks
  app.get("/api/tasks", async (req, res) => {
    const tasks = await tasksCollection.find().toArray();

    res.json(
      tasks.map((task) => ({
        id: task._id.toString(),
        task: task.task,
      }))
    );
  });

  // Create a task
  app.post("/api/tasks", async (req, res) => {
    const { task } = req.body;

    if (!task || task.trim() === "") {
      return res.status(400).json({ error: "Task is required" });
    }

    const newTask = {
      task: task.trim(),
    };

    const result = await tasksCollection.insertOne(newTask);

    res.status(201).json({
      id: result.insertedId.toString(),
      task: newTask.task,
    });
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await tasksCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.json({ message: "Task deleted" });
    } catch (error) {
      res.status(400).json({ error: "Invalid task ID" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("MongoDB connection failed:", error);
});