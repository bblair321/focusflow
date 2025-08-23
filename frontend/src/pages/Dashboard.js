import React, { useState, useEffect } from "react";
import GoalList from "../components/GoalList";
import GoalCalendar from "../components/GoalCalendar";
import axios from "axios";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedMilestones: 0,
    totalMilestones: 0,
  });
  const [goals, setGoals] = useState([]);
  const [categories, setCategories] = useState({});
  const [categoryStats, setCategoryStats] = useState({});

  useEffect(() => {
    fetchStats();
    fetchCategories();
  }, []);

  useEffect(() => {
    // Calculate category statistics when goals change
    if (goals.length > 0 && Object.keys(categories).length > 0) {
      calculateCategoryStats();
    }
  }, [goals, categories]);

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

  const calculateCategoryStats = () => {
    const stats = {};
    Object.keys(categories).forEach((cat) => {
      const categoryGoals = goals.filter((goal) => goal.category === cat);
      const totalMilestones = categoryGoals.reduce(
        (sum, goal) => sum + goal.milestones.length,
        0
      );
      const completedMilestones = categoryGoals.reduce(
        (sum, goal) => sum + goal.milestones.filter((m) => m.completed).length,
        0
      );

      stats[cat] = {
        count: categoryGoals.length,
        totalMilestones,
        completedMilestones,
        percentage:
          totalMilestones > 0
            ? Math.round((completedMilestones / totalMilestones) * 100)
            : 0,
      };
    });
    setCategoryStats(stats);
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      // Fetch both active and archived goals for the calendar
      const response = await axios.get("/goals/?include_archived=true", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const goalsData = response.data;
      setGoals(goalsData);
      const totalGoals = goalsData.length;
      const totalMilestones = goalsData.reduce(
        (sum, goal) => sum + goal.milestones.length,
        0
      );
      const completedMilestones = goalsData.reduce(
        (sum, goal) => sum + goal.milestones.filter((m) => m.completed).length,
        0
      );
      const completedGoals = goalsData.filter((goal) => 
        goal.milestones.length > 0 && 
        goal.milestones.every((m) => m.completed)
      ).length;

      setStats({
        totalGoals,
        totalMilestones,
        completedMilestones,
        completedGoals,
      });
      
      // Show success toast for user feedback
      if (window.showToast) {
        window.showToast("Goals updated successfully!", "success");
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      if (window.showToast) {
        window.showToast("Failed to update goals", "error");
      }
    }
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Welcome to FocusFlow</h1>
        <p className="dashboard-subtitle">
          Track your goals and celebrate your progress
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalGoals}</div>
          <div className="stat-label">Total Goals</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalMilestones}</div>
          <div className="stat-label">Total Milestones</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {stats.totalMilestones > 0
              ? Math.round(
                  (stats.completedMilestones / stats.totalMilestones) * 100
                )
              : 0}
            %
          </div>
          <div className="stat-label">Milestone Completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completedGoals}</div>
          <div className="stat-label">Completed Goals</div>
        </div>
      </div>

      {/* Goal Calendar Section */}
      <div className="card mb-4">
        <h3 className="mb-3">Goal Timeline</h3>
        <p className="text-muted mb-3">
          Track your progress with this interactive calendar showing when goals
          were created, milestones were completed, and goals were finished.
        </p>
        <GoalCalendar goals={goals} />
      </div>

      {/* Goals List */}
      <div className="card">
        <GoalList user={user} onGoalsUpdate={fetchStats} />
      </div>
    </div>
  );
}

export default Dashboard;
