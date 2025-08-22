from flask import Blueprint, request, jsonify
from .models import db, Goal, Milestone
from .auth import login_required
from datetime import datetime

goals_bp = Blueprint('goals', __name__)

# Goals endpoints
@goals_bp.route('/', methods=['GET'])
@login_required
def get_goals():
    """Get all active (non-archived) goals for the authenticated user"""
    user_id = request.user_id  # Set by login_required decorator
    include_archived = request.args.get('include_archived', 'false').lower() == 'true'
    
    if include_archived:
        goals = Goal.query.filter_by(user_id=user_id).all()
    else:
        goals = Goal.query.filter_by(user_id=user_id, archived=False).all()
    
    return jsonify([goal.to_dict() for goal in goals])

@goals_bp.route('/', methods=['POST'])
@login_required
def create_goal():
    """Create a new goal"""
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    user_id = request.user_id
    goal = Goal(
        title=data['title'],
        description=data.get('description', ''),
        user_id=user_id
    )
    
    db.session.add(goal)
    db.session.commit()
    
    return jsonify(goal.to_dict()), 201

@goals_bp.route('/<int:goal_id>', methods=['GET'])
@login_required
def get_goal(goal_id):
    """Get a specific goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    return jsonify(goal.to_dict())

@goals_bp.route('/<int:goal_id>', methods=['PUT'])
@login_required
def update_goal(goal_id):
    """Update a goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        goal.title = data['title']
    if 'description' in data:
        goal.description = data['description']
    
    db.session.commit()
    return jsonify(goal.to_dict())

@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@login_required
def delete_goal(goal_id):
    """Delete a goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    db.session.delete(goal)
    db.session.commit()
    
    return jsonify({'message': 'Goal deleted successfully'})

@goals_bp.route('/<int:goal_id>/archive', methods=['POST'])
@login_required
def archive_goal(goal_id):
    """Archive a goal (soft delete)"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    goal.archived = True
    goal.archived_at = datetime.utcnow()
    db.session.commit()
    
    return jsonify({'message': 'Goal archived successfully'})

@goals_bp.route('/<int:goal_id>/unarchive', methods=['POST'])
@login_required
def unarchive_goal(goal_id):
    """Unarchive a goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    goal.archived = False
    goal.archived_at = None
    db.session.commit()
    
    return jsonify({'message': 'Goal unarchived successfully'})

@goals_bp.route('/archived', methods=['GET'])
@login_required
def get_archived_goals():
    """Get all archived goals for the authenticated user"""
    user_id = request.user_id
    goals = Goal.query.filter_by(user_id=user_id, archived=True).all()
    return jsonify([goal.to_dict() for goal in goals])

# Milestones endpoints
@goals_bp.route('/<int:goal_id>/milestones', methods=['GET'])
@login_required
def get_milestones(goal_id):
    """Get all milestones for a specific goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    return jsonify([milestone.to_dict() for milestone in goal.milestones])

@goals_bp.route('/<int:goal_id>/milestones', methods=['POST'])
@login_required
def create_milestone(goal_id):
    """Create a new milestone for a goal"""
    user_id = request.user_id
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404
    
    data = request.get_json()
    
    if not data or 'title' not in data:
        return jsonify({'error': 'Title is required'}), 400
    
    milestone = Milestone(
        title=data['title'],
        goal_id=goal_id
    )
    
    db.session.add(milestone)
    db.session.commit()
    
    return jsonify(milestone.to_dict()), 201

@goals_bp.route('/milestones/<int:milestone_id>', methods=['PUT'])
@login_required
def update_milestone(milestone_id):
    """Update a milestone"""
    user_id = request.user_id
    milestone = Milestone.query.join(Goal).filter(
        Milestone.id == milestone_id,
        Goal.user_id == user_id
    ).first()
    
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    data = request.get_json()
    
    if 'title' in data:
        milestone.title = data['title']
    if 'completed' in data:
        milestone.completed = data['completed']
    
    db.session.commit()
    
    # Check if all milestones are completed and auto-archive the goal
    goal = Goal.query.get(milestone.goal_id)
    if goal and all(m.completed for m in goal.milestones) and len(goal.milestones) > 0:
        goal.archived = True
        goal.archived_at = datetime.utcnow()
        db.session.commit()
    
    return jsonify(milestone.to_dict())

@goals_bp.route('/milestones/<int:milestone_id>', methods=['DELETE'])
@login_required
def delete_milestone(milestone_id):
    """Delete a milestone"""
    user_id = request.user_id
    milestone = Milestone.query.join(Goal).filter(
        Milestone.id == milestone_id,
        Goal.user_id == user_id
    ).first()
    
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404
    
    db.session.delete(milestone)
    db.session.commit()
    
    return jsonify({'message': 'Milestone deleted successfully'})
