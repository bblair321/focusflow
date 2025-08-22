import React, { useState, useEffect } from "react";
import GoalForm from "./GoalForm";
import GoalEditModal from "./GoalEditModal";
import MilestoneList from "./MilestoneList";
import ProgressBar from "./ProgressBar";
import axios from "axios";

function GoalList({ user, onGoalsUpdate }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

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
      if (onGoalsUpdate) onGoalsUpdate();
      if (window.showToast) {
        window.showToast("Goal created successfully!", "success");
      }
    } catch (err) {
      setError("Failed to create goal");
      if (window.showToast) {
        window.showToast("Failed to create goal", "error");
      }
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
      if (onGoalsUpdate) onGoalsUpdate();
      if (window.showToast) {
        window.showToast("Goal updated successfully!", "success");
      }
    } catch (err) {
      setError("Failed to update goal");
      if (window.showToast) {
        window.showToast("Failed to update goal", "error");
      }
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
      if (onGoalsUpdate) onGoalsUpdate();
      if (window.showToast) {
        window.showToast("Goal deleted successfully!", "success");
      }
    } catch (err) {
      setError("Failed to delete goal");
      if (window.showToast) {
        window.showToast("Failed to delete goal", "error");
      }
    }
  };

  // Calculate goal progress
  const calculateGoalProgress = (goal) => {
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(
      (m) => m.completed
    ).length;
    const percentage =
      totalMilestones === 0
        ? 0
        : Math.round((completedMilestones / totalMilestones) * 100);

    return {
      total: totalMilestones,
      completed: completedMilestones,
      percentage,
    };
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
                  onClick={() => {
                    setEditingGoal(goal);
                    setIsEditModalOpen(true);
                  }}
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

            {/* Goal Progress Section */}
            <div className="goal-progress-section">
              <div className="goal-stats">
                <div className="goal-stat">
                  <span className="goal-stat-number">
                    {goal.milestones.length}
                  </span>
                  <span className="goal-stat-label">Total Milestones</span>
                </div>
                <div className="goal-stat">
                  <span className="goal-stat-number">
                    {goal.milestones.filter((m) => m.completed).length}
                  </span>
                  <span className="goal-stat-label">Completed</span>
                </div>
                <div className="goal-stat">
                  <span className="goal-stat-number">
                    {calculateGoalProgress(goal).percentage}%
                  </span>
                  <span className="goal-stat-label">Progress</span>
                </div>
              </div>

              <ProgressBar
                completed={calculateGoalProgress(goal).completed}
                total={calculateGoalProgress(goal).total}
                size="large"
              />
            </div>

            <MilestoneList
              goalId={goal.id}
              milestones={goal.milestones}
              onMilestoneUpdate={() => {
                fetchGoals();
                if (onGoalsUpdate) onGoalsUpdate();
              }}
            />
          </div>
        ))
      )}

      {/* Edit Goal Modal */}
      <GoalEditModal
        goal={editingGoal}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingGoal(null);
        }}
        onSave={updateGoal}
      />
    </div>
  );
}

export default GoalList;
