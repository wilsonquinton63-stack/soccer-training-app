import { useEffect, useState } from "react";
import "./App.css";

const API_URL = "http://localhost:5001/api/tasks";

function App() {
  const [tasks, setTasks] = useState([]);
  const [task, setTask] = useState("");

  // Get tasks from the backend
  useEffect(() => {
    fetch(API_URL)
      .then((response) => response.json())
      .then((data) => setTasks(data))
      .catch((error) => console.error("Error getting tasks:", error));
  }, []);

  // Add a task
  const addTask = async (e) => {
    e.preventDefault();

    if (task.trim() === "") return;

    try {
      const response = await fetch(API_URL, {
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

  // Delete a task
  const deleteTask = async (id) => {
    try {
      await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
      });

      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1>⚽ Soccer Training Planner</h1>
        <p className="subtitle">
          Create and manage your soccer training tasks
        </p>

        <form onSubmit={addTask} className="task-form">
          <input
            type="text"
            placeholder="Enter a training task..."
            value={task}
            onChange={(e) => setTask(e.target.value)}
          />

          <button type="submit">Add Task</button>
        </form>

        <div className="task-section">
          <h2>Training Tasks</h2>

          {tasks.length === 0 ? (
            <p className="empty">No training tasks yet. Add one above!</p>
          ) : (
            tasks.map((task) => (
              <div className="task-card" key={task.id}>
                <span>{task.task}</span>

                <button
                  className="delete-button"
                  onClick={() => deleteTask(task.id)}
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