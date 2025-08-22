import React, { useState } from "react";

function GoalForm({ onAddGoal }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    setIsSubmitting(true);

    try {
      await onAddGoal({
        title: title.trim(),
        description: description.trim(),
      });

      // Reset form
      setTitle("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-4">
      <h3>Add New Goal</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Goal Title *</label>
          <input
            type="text"
            id="title"
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What do you want to achieve?"
            maxLength="200"
            required
          />
          <div
            className={`char-counter ${title.length > 150 ? "warning" : ""} ${
              title.length > 180 ? "danger" : ""
            }`}
          >
            {title.length}/200 characters
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional: Add more details about your goal"
            rows="3"
            maxLength="1000"
          />
          <div
            className={`char-counter ${
              description.length > 800 ? "warning" : ""
            } ${description.length > 950 ? "danger" : ""}`}
          >
            {description.length}/1000 characters
          </div>
        </div>

        <button
          type="submit"
          className="btn"
          disabled={isSubmitting || !title.trim()}
        >
          {isSubmitting ? "Creating..." : "Create Goal"}
        </button>
      </form>
    </div>
  );
}

export default GoalForm;
