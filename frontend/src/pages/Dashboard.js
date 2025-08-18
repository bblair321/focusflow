import React, { useState, useEffect } from "react";
import GoalList from "../components/GoalList";
import axios from "axios";

function Dashboard({ user }) {
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedMilestones: 0,
    totalMilestones: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get("/goals/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const goals = response.data;
      const totalGoals = goals.length;
      const totalMilestones = goals.reduce(
        (sum, goal) => sum + goal.milestones.length,
        0
      );
      const completedMilestones = goals.reduce(
        (sum, goal) => sum + goal.milestones.filter((m) => m.completed).length,
        0
      );

      setStats({
        totalGoals,
        completedMilestones,
        totalMilestones,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
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
          <div className="stat-label">Completion Rate</div>
        </div>
      </div>

      {/* Goals List */}
      <div className="card">
        <GoalList user={user} onGoalsUpdate={fetchStats} />
      </div>
    </div>
  );
}

export default Dashboard;
