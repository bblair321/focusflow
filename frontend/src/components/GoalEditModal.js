import React, { useState, useEffect } from 'react';

function GoalEditModal({ goal, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title || '',
        description: goal.description || ''
      });
      setErrors({});
    }
  }, [goal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.title.length > 200) {
      newErrors.title = 'Title must be less than 200 characters';
    }
    
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSave(goal.id, {
        title: formData.title.trim(),
        description: formData.description.trim()
      });
      onClose();
    } catch (error) {
      console.error('Failed to update goal:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Goal</h3>
          <button 
            className="modal-close" 
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="edit-title">Goal Title *</label>
            <input
              type="text"
              id="edit-title"
              name="title"
              className={`form-control ${errors.title ? 'is-invalid' : ''}`}
              value={formData.title}
              onChange={handleChange}
              placeholder="What do you want to achieve?"
              maxLength="200"
              required
            />
            {errors.title && (
              <div className="invalid-feedback">{errors.title}</div>
            )}
          </div>
          
          <div className="form-group">
            <label htmlFor="edit-description">Description</label>
            <textarea
              id="edit-description"
              name="description"
              className={`form-control ${errors.description ? 'is-invalid' : ''}`}
              value={formData.description}
              onChange={handleChange}
              placeholder="Optional: Add more details about your goal"
              rows="4"
              maxLength="1000"
            />
            {errors.description && (
              <div className="invalid-feedback">{errors.description}</div>
            )}
            <small className="form-text text-muted">
              {formData.description.length}/1000 characters
            </small>
          </div>
          
          <div className="modal-actions">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalEditModal;
