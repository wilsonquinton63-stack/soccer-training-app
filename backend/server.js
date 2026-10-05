require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
const { GoogleGenAI } = require("@google/genai");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../frontend/build")));

const client = new MongoClient(process.env.MONGODB_URI);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function startServer() {
  await client.connect();

  console.log("Connected to MongoDB!");

  const db = client.db("soccerTraining");
  const tasksCollection = db.collection("tasks");

  // Get all tasks
  app.get("/api/tasks", async (req, res) => {
    try {
      const tasks = await tasksCollection.find().toArray();

      res.json(
        tasks.map((task) => ({
          id: task._id.toString(),
          task: task.task,
        }))
      );
    } catch (error) {
      console.error("Error getting tasks:", error);
      res.status(500).json({ error: "Could not get tasks" });
    }
  });

  // Add a task
  app.post("/api/tasks", async (req, res) => {
    try {
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
    } catch (error) {
      console.error("Error adding task:", error);
      res.status(500).json({ error: "Could not add task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      await tasksCollection.deleteOne({
        _id: new ObjectId(req.params.id),
      });

      res.json({ message: "Task deleted" });
    } catch (error) {
      console.error("Error deleting task:", error);
      res.status(400).json({ error: "Invalid task ID" });
    }
  });

 // AI soccer training plan
app.post("/api/ai-plan", async (req, res) => {
  try {
    const { goal } = req.body;

    if (!goal || goal.trim() === "") {
      return res.status(400).json({ error: "Training goal is required" });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: `You are a soccer training coach.

Create a practical soccer training session for a college-level soccer player whose goal is:

${goal.trim()}

Include:
- Warm-up
- 3 to 5 training drills
- Sets or time for each drill
- Short coaching tips
- Cool-down

Keep the plan realistic and easy to follow.`,
    });

    res.json({
      plan: response.text,
    });
  } catch (error) {
    console.error("AI plan error:", error);

    res.status(500).json({
      error: error.message,
    });
  }
});
app.use((req, res, next) => {
  if (req.method === "GET" && !req.path.startsWith("/api/")) {
    return res.sendFile(
      path.join(__dirname, "../frontend/build/index.html")
    );
  }

  next();
});

  app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Server failed to start:", error);
});