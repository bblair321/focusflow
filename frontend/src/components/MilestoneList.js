import React, { useState } from "react";
import axios from "axios";

function MilestoneList({ goalId, milestones, onMilestoneUpdate }) {
  const [newMilestone, setNewMilestone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addMilestone = async (e) => {
    e.preventDefault();

    if (!newMilestone.trim()) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      await axios.post(
        `/goals/${goalId}/milestones`,
        {
          title: newMilestone.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setNewMilestone("");
      onMilestoneUpdate(); // Refresh the goals list
      // Toast notification handled by parent component
    } catch (error) {
      console.error("Failed to create milestone:", error);
      if (window.showToast) {
        window.showToast("Failed to add milestone", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMilestone = async (milestoneId, completed) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `/goals/milestones/${milestoneId}`,
        {
          completed: !completed,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      onMilestoneUpdate(); // Refresh the goals list
      // Toast notification handled by parent component
    } catch (error) {
      console.error("Failed to update milestone:", error);
      if (window.showToast) {
        window.showToast("Failed to update milestone", "error");
      }
    }
  };

  const deleteMilestone = async (milestoneId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/goals/milestones/${milestoneId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      onMilestoneUpdate(); // Refresh the goals list
      // Toast notification handled by parent component
    } catch (error) {
      console.error("Failed to delete milestone:", error);
      if (window.showToast) {
        window.showToast("Failed to delete milestone", "error");
      }
    }
  };

  return (
    <div>
      <h5>Milestones ({milestones.length})</h5>

      {/* Add new milestone form */}
      <form onSubmit={addMilestone} className="mb-3">
        <div className="d-flex">
          <input
            type="text"
            className="form-control me-2"
            value={newMilestone}
            onChange={(e) => setNewMilestone(e.target.value)}
            placeholder="Add a new milestone..."
            maxLength="200"
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="btn btn-secondary"
            disabled={isSubmitting || !newMilestone.trim()}
          >
            {isSubmitting ? "Adding..." : "Add"}
          </button>
        </div>
        <div
          className={`char-counter ${
            newMilestone.length > 150 ? "warning" : ""
          } ${newMilestone.length > 180 ? "danger" : ""}`}
        >
          {newMilestone.length}/200 characters
        </div>
      </form>

      {/* Milestones list */}
      {milestones.length === 0 ? (
        <p className="text-muted">
          No milestones yet. Add your first milestone to track progress!
        </p>
      ) : (
        milestones.map((milestone) => (
          <div key={milestone.id} className="milestone-item">
            <input
              type="checkbox"
              className="milestone-checkbox"
              checked={milestone.completed}
              onChange={() =>
                toggleMilestone(milestone.id, milestone.completed)
              }
            />
            <span
              className={`milestone-title ${
                milestone.completed ? "milestone-completed" : ""
              }`}
            >
              {milestone.title}
            </span>
            <button
              onClick={() => deleteMilestone(milestone.id)}
              className="milestone-delete-btn"
              title="Delete milestone"
            >
              ×
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default MilestoneList;
