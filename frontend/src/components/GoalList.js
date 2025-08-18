import React, { useState, useEffect } from "react";
import GoalForm from "./GoalForm";
import MilestoneList from "./MilestoneList";
import axios from "axios";

function GoalList({ user }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/goals/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(response.data);
      setLoading(false);
    } catch (err) {
      setError("Failed to fetch goals");
      setLoading(false);
    }
  };

  const addGoal = async (goalData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post("/goals/", goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals([...goals, response.data]);
    } catch (err) {
      setError("Failed to create goal");
    }
  };

  const updateGoal = async (goalId, goalData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`/goals/${goalId}`, goalData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(
        goals.map((goal) => (goal.id === goalId ? response.data : goal))
      );
    } catch (err) {
      setError("Failed to update goal");
    }
  };

  const deleteGoal = async (goalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGoals(goals.filter((goal) => goal.id !== goalId));
    } catch (err) {
      setError("Failed to delete goal");
    }
  };

  if (loading) return <div className="text-center">Loading goals...</div>;
  if (error) return <div className="text-center text-danger">{error}</div>;

  return (
    <div>
      <GoalForm onAddGoal={addGoal} />

      <div className="mb-4">
        <h3>Your Goals ({goals.length})</h3>
      </div>

      {goals.length === 0 ? (
        <div className="card text-center">
          <p>No goals yet. Create your first goal to get started!</p>
        </div>
      ) : (
        goals.map((goal) => (
          <div key={goal.id} className="goal-item">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <h4 className="goal-title">{goal.title}</h4>
                {goal.description && (
                  <p className="goal-description">{goal.description}</p>
                )}
              </div>
              <div>
                <button
                  onClick={() =>
                    updateGoal(goal.id, {
                      title: goal.title,
                      description: goal.description,
                    })
                  }
                  className="btn btn-secondary me-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => deleteGoal(goal.id)}
                  className="btn btn-secondary"
                  style={{ background: "#dc3545" }}
                >
                  Delete
                </button>
              </div>
            </div>

            <MilestoneList
              goalId={goal.id}
              milestones={goal.milestones}
              onMilestoneUpdate={() => fetchGoals()}
            />
          </div>
        ))
      )}
    </div>
  );
}

export default GoalList;
