import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ArchiveModal({ isOpen, onClose, onGoalsUpdate }) {
  const [archivedGoals, setArchivedGoals] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchArchivedGoals();
    }
  }, [isOpen]);

  const fetchArchivedGoals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/goals/archived', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setArchivedGoals(response.data);
    } catch (error) {
      console.error('Failed to fetch archived goals:', error);
      if (window.showToast) {
        window.showToast('Failed to load archived goals', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  const unarchiveGoal = async (goalId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/goals/${goalId}/unarchive`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (window.showToast) {
        window.showToast('Goal unarchived successfully!', 'success');
      }
      
      // Refresh archived goals and notify parent
      fetchArchivedGoals();
      if (onGoalsUpdate) onGoalsUpdate();
    } catch (error) {
      console.error('Failed to unarchive goal:', error);
      if (window.showToast) {
        window.showToast('Failed to unarchive goal', 'error');
      }
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to permanently delete this goal? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/goals/${goalId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (window.showToast) {
        window.showToast('Goal permanently deleted', 'success');
      }
      
      // Refresh archived goals and notify parent
      fetchArchivedGoals();
      if (onGoalsUpdate) onGoalsUpdate();
    } catch (error) {
      console.error('Failed to delete goal:', error);
      if (window.showToast) {
        window.showToast('Failed to delete goal', 'error');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content archive-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Archived Goals</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="text-center">Loading archived goals...</div>
          ) : archivedGoals.length === 0 ? (
            <div className="text-center text-muted">
              <p>No archived goals found.</p>
              <p>Goals are automatically archived when all milestones are completed.</p>
            </div>
          ) : (
            <div className="archived-goals-list">
              {archivedGoals.map(goal => (
                <div key={goal.id} className="archived-goal-item">
                  <div className="archived-goal-header">
                    <h4 className="archived-goal-title">{goal.title}</h4>
                    <span className="archived-date">
                      Archived: {new Date(goal.archived_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {goal.description && (
                    <p className="archived-goal-description">{goal.description}</p>
                  )}
                  
                  <div className="archived-goal-stats">
                    <span className="archived-stat">
                      {goal.milestones.length} milestone{goal.milestones.length !== 1 ? 's' : ''}
                    </span>
                    <span className="archived-stat">
                      {goal.milestones.filter(m => m.completed).length} completed
                    </span>
                  </div>
                  
                  <div className="archived-goal-actions">
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => unarchiveGoal(goal.id)}
                    >
                      Restore Goal
                    </button>
                    <button 
                      className="btn btn-danger btn-sm"
                      onClick={() => deleteGoal(goal.id)}
                    >
                      Delete Permanently
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArchiveModal;
