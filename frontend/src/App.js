import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import "./App.css";
const API_URL = "/api";

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");

  const [goal, setGoal] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/tasks`)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error getting tasks:", error));
  }, []);

  const addTask = async (e) => {
    e.preventDefault();

    if (!task.trim()) return;

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ task }),
      });

      const newTask = await response.json();

      setTasks([...tasks, newTask]);
      setTask("");
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const generatePlan = async (e) => {
    e.preventDefault();

    if (!goal.trim()) return;

    setLoading(true);
    setPlan("");

    try {
      const response = await fetch(`${API_URL}/ai-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ goal }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate plan");
      }

      setPlan(data.plan);
    } catch (error) {
      console.error("AI error:", error);
      setPlan("Something went wrong generating the training plan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>⚽ Soccer Training Planner</h1>

        <p className="subtitle">
          Create tasks and generate personalized training plans.
        </p>

        <div className="ai-section">
          <h2>AI Training Plan</h2>

          <form onSubmit={generatePlan}>
            <input
              type="text"
              placeholder="What do you want to improve?"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />

            <button type="submit" disabled={loading}>
              {loading ? "Generating..." : "Generate Plan"}
            </button>
          </form>

          {plan && (
  <div className="plan">
    <h3>Your Training Plan</h3>
   <div className="plan-text">
  <ReactMarkdown>{plan}</ReactMarkdown>
</div>
  </div>
)}
        </div>

        <div className="task-section">
          <h2>Training Tasks</h2>

          <form onSubmit={addTask} className="task-form">
            <input
              type="text"
              placeholder="Enter a training task..."
              value={task}
              onChange={(e) => setTask(e.target.value)}
            />

            <button type="submit">Add Task</button>
          </form>

          {tasks.length === 0 ? (
            <p className="empty">No training tasks yet.</p>
          ) : (
            tasks.map((item) => (
              <div className="task-card" key={item.id}>
                <span>{item.task}</span>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(item.id)}
                >
                  Delete
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;