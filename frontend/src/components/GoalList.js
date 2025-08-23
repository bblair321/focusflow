import React, { useState, useEffect } from "react";
import GoalForm from "./GoalForm";
import GoalEditModal from "./GoalEditModal";
import MilestoneList from "./MilestoneList";
import ProgressBar from "./ProgressBar";
import ArchiveModal from "./ArchiveModal";
import axios from "axios";

function GoalList({ user, onGoalsUpdate }) {
  const [goals, setGoals] = useState([]);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [archiveCount, setArchiveCount] = useState(0);
  const [categories, setCategories] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetchGoals();
    fetchArchiveCount();
    fetchCategories();

    // Set up periodic refresh of archive count every 30 seconds
    const interval = setInterval(fetchArchiveCount, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Filter goals based on selected category
    if (selectedCategory === "All") {
      setFilteredGoals(goals);
    } else {
      setFilteredGoals(
        goals.filter((goal) => goal.category === selectedCategory)
      );
    }
  }, [goals, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/goals/categories", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(response.data);
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

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

  const fetchArchiveCount = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/goals/archived", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const count = response.data.length;
      setArchiveCount(count);
    } catch (err) {
      console.error("Failed to fetch archive count:", err);
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
      // Toast notification handled by parent component
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
      // Toast notification handled by parent component
    } catch (err) {
      setError("Failed to update goal");
      if (window.showToast) {
        window.showToast("Failed to update goal", "error");
      }
    }
  };

  const deleteGoal = async (goalId) => {
    if (window.confirm("Are you sure you want to delete this goal?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`/goals/${goalId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setGoals(goals.filter((goal) => goal.id !== goalId));
        if (onGoalsUpdate) onGoalsUpdate();
        // Toast notification handled by parent component
      } catch (err) {
        setError("Failed to delete goal");
        if (window.showToast) {
          window.showToast("Failed to delete goal", "error");
        }
      }
    }
  };

  const archiveGoal = async (goalId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/goals/${goalId}/archive`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setGoals(goals.filter((goal) => goal.id !== goalId));
      if (onGoalsUpdate) onGoalsUpdate();
      // Toast notification handled by parent component
    } catch (err) {
      setError("Failed to archive goal");
      if (window.showToast) {
        window.showToast("Failed to archive goal", "error");
      }
    }
  };

  const calculateGoalProgress = (goal) => {
    const total = goal.milestones.length;
    const completed = goal.milestones.filter((m) => m.completed).length;
    const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percentage };
  };

  const shouldShowQuickArchive = (goal) => {
    const progress = calculateGoalProgress(goal);
    return progress.total > 0 && progress.percentage >= 80;
  };

  // Category filter component
  const CategoryFilter = () => (
    <div className="category-filter">
      <h4>Filter by category:</h4>
      <select
        className="category-filter-select"
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
      >
        <option value="All">All Categories</option>
        {Object.keys(categories).map((cat) => (
          <option key={cat} value={cat}>
            {cat}
          </option>
        ))}
      </select>
    </div>
  );

  // Category tag component
  const CategoryTag = ({ category }) => {
    const color = categories[category] || "#6B7280";
    return (
      <span
        className="category-tag"
        style={{
          backgroundColor: color,
          color: "white",
          padding: "4px 8px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: "500",
          display: "inline-block",
          marginBottom: "8px",
        }}
      >
        {category}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="text-center">
        <p>Loading goals...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        {error}
      </div>
    );
  }

  return (
    <div>
      <GoalForm onAddGoal={addGoal} />

      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Your Goals</h3>
        <button
          onClick={() => setIsArchiveModalOpen(true)}
          className="btn btn-secondary position-relative"
        >
          View Archive
          {archiveCount > 0 && (
            <span
              className={`archive-badge ${
                archiveCount >= 10
                  ? "count-very-high"
                  : archiveCount >= 5
                  ? "count-high"
                  : ""
              }`}
            >
              {archiveCount}
            </span>
          )}
        </button>
      </div>

      <CategoryFilter />

      {filteredGoals.length === 0 ? (
        <div className="card text-center">
          <p>
            {selectedCategory === "All"
              ? "No goals yet. Create your first goal to get started!"
              : `No goals in the "${selectedCategory}" category.`}
          </p>
        </div>
      ) : (
        filteredGoals.map((goal) => (
          <div key={goal.id} className="goal-item">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div>
                <div className="d-flex align-items-center mb-2">
                  <CategoryTag category={goal.category} />
                </div>
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
                  onClick={() => archiveGoal(goal.id)}
                  className="btn btn-secondary me-2"
                  style={{ background: "#6c757d" }}
                >
                  Archive
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

              {/* Quick Archive Option */}
              {shouldShowQuickArchive(goal) && (
                <div className="quick-archive-section">
                  <button
                    onClick={() => archiveGoal(goal.id)}
                    className="btn btn-outline-success btn-sm"
                    title="Archive this goal since it's mostly complete"
                  >
                    🎯 Quick Archive
                  </button>
                  <small className="text-muted d-block mt-1">
                    This goal is {calculateGoalProgress(goal).percentage}%
                    complete
                  </small>
                </div>
              )}
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

      {/* Archive Modal */}
      <ArchiveModal
        isOpen={isArchiveModalOpen}
        onClose={() => {
          setIsArchiveModalOpen(false);
          fetchArchiveCount(); // Refresh count when closing modal
        }}
        onGoalsUpdate={onGoalsUpdate}
      />
    </div>
  );
}

export default GoalList;
