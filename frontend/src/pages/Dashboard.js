import React, { useState, useEffect } from "react";
import GoalList from "../components/GoalList";
import ProgressBar from "../components/ProgressBar";
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

      // Calculate goal completion rates
      const completedGoals = goals.filter(
        (goal) =>
          goal.milestones.length > 0 &&
          goal.milestones.every((m) => m.completed)
      ).length;

      const goalCompletionRate =
        totalGoals === 0 ? 0 : Math.round((completedGoals / totalGoals) * 100);
      const milestoneCompletionRate =
        totalMilestones === 0
          ? 0
          : Math.round((completedMilestones / totalMilestones) * 100);

      setStats({
        totalGoals,
        completedMilestones,
        totalMilestones,
        completedGoals,
        goalCompletionRate,
        milestoneCompletionRate,
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
          <div className="stat-label">Milestone Completion</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.completedGoals}</div>
          <div className="stat-label">Completed Goals</div>
        </div>
      </div>

      {/* Overall Progress Section */}
      <div className="card mb-4">
        <h3 className="mb-3">Overall Progress</h3>
        <div className="overall-progress-stats">
          <div className="goal-stat">
            <span className="goal-stat-number">{stats.totalMilestones}</span>
            <span className="goal-stat-label">Total Milestones</span>
          </div>
          <div className="goal-stat">
            <span className="goal-stat-number">
              {stats.completedMilestones}
            </span>
            <span className="goal-stat-label">Completed</span>
          </div>
          <div className="goal-stat">
            <span className="goal-stat-number">
              {stats.milestoneCompletionRate}%
            </span>
            <span className="goal-stat-label">Progress</span>
          </div>
        </div>

        <ProgressBar
          completed={stats.completedMilestones}
          total={stats.totalMilestones}
          size="large"
        />
      </div>

      {/* Goals List */}
      <div className="card">
        <GoalList user={user} onGoalsUpdate={fetchStats} />
      </div>
    </div>
  );
}

export default Dashboard;
