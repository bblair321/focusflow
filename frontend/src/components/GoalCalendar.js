import React, { useState, useEffect } from "react";

function GoalCalendar({ goals }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState("monthly"); // 'daily', 'weekly', 'monthly'
  const [expandedGroups, setExpandedGroups] = useState({
    "goal-created": true,
    "milestone-completed": true,
    "goal-completed": true,
  });

  // Auto-select current date when switching to daily view
  useEffect(() => {
    if (viewMode === "daily") {
      setSelectedDate(currentDate);
    }
  }, [viewMode, currentDate]);

  // Toggle event group expansion
  const toggleEventGroup = (groupType) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupType]: !prev[groupType],
    }));
  };

  // Go to today function
  const goToToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Calculate goal counts for summary

  const activeGoals = goals.filter((g) => {
    return (
      g.archived === false || g.archived === null || g.archived === undefined
    );
  });
  const archivedGoals = goals.filter((g) => g.archived === true);

  // Get current month/year
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const firstDayIndex = firstDayOfMonth.getDay();

  // Generate calendar days for monthly view
  const generateCalendarDays = () => {
    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: "", isEmpty: true });
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      days.push({ day, date, isEmpty: false });
    }

    return days;
  };

  // Generate weekly view
  const generateWeeklyView = () => {
    const weekStart = new Date(currentDate);
    weekStart.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(weekStart);
      date.setDate(weekStart.getDate() + i);
      weekDays.push({ day: date.getDate(), date, isEmpty: false });
    }

    return weekDays;
  };

  // Generate daily view
  const generateDailyView = () => {
    // For daily view, automatically select the current date to show events
    if (viewMode === "daily" && !selectedDate) {
      setSelectedDate(currentDate);
    }
    return [{ day: currentDate.getDate(), date: currentDate, isEmpty: false }];
  };

  // Helper function to format dates consistently
  const formatDateForComparison = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-CA"); // Returns YYYY-MM-DD format
  };

  // Get events for a specific date (improved to handle all event types)
  const getEventsForDate = (date) => {
    if (!date) return [];

    const events = [];

    // Format the target date for comparison
    const targetDateFormatted = formatDateForComparison(date);

    goals.forEach((goal) => {
      // Check if goal was created on this date
      const goalCreatedFormatted = formatDateForComparison(goal.created_at);
      if (goalCreatedFormatted === targetDateFormatted) {
        events.push({
          type: "goal-created",
          title: goal.title,
          goal: goal,
          isArchived: goal.archived,
        });
      }

      // Check if goal was completed/archived on this date
      if (goal.archived && goal.archived_at) {
        const goalCompletedFormatted = formatDateForComparison(
          goal.archived_at
        );
        if (goalCompletedFormatted === targetDateFormatted) {
          events.push({
            type: "goal-completed",
            title: goal.title,
            goal: goal,
            isArchived: true,
          });
        }
      }

      // Check milestone completions (for all goals, including archived ones)
      goal.milestones.forEach((milestone) => {
        if (milestone.completed && milestone.completed_at) {
          const milestoneCompletedFormatted = formatDateForComparison(
            milestone.completed_at
          );
          if (milestoneCompletedFormatted === targetDateFormatted) {
            events.push({
              type: "milestone-completed",
              title: milestone.title,
              goal: goal,
              milestone: milestone,
              isArchived: goal.archived,
            });
          }
        }
      });
    });

    return events;
  };

  // Navigate to previous period
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "daily":
        newDate.setDate(currentDate.getDate() - 1);
        break;
      case "weekly":
        newDate.setDate(currentDate.getDate() - 7);
        break;
      case "monthly":
      default:
        newDate.setMonth(currentDate.getMonth() - 1);
        break;
    }
    setCurrentDate(newDate);
  };

  // Navigate to next period
  const goToNext = () => {
    const newDate = new Date(currentDate);
    switch (viewMode) {
      case "daily":
        newDate.setDate(currentDate.getDate() + 1);
        break;
      case "weekly":
        newDate.setDate(currentDate.getDate() + 7);
        break;
      case "monthly":
      default:
        newDate.setMonth(currentDate.getMonth() + 1);
        break;
    }
    setCurrentDate(newDate);
  };

  // Get month name
  const getMonthName = (month) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[month];
  };

  // Get day name
  const getDayName = (dayIndex) => {
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[dayIndex];
  };

  // Get event color based on type
  const getEventColor = (type) => {
    switch (type) {
      case "goal-created":
        return "#28a745"; // Green
      case "goal-completed":
        return "#dc3545"; // Red
      case "milestone-completed":
        return "#007bff"; // Blue
      default:
        return "#6c757d"; // Gray
    }
  };

  // Get event icon based on type
  const getEventIcon = (type) => {
    switch (type) {
      case "goal-created":
        return "🎯";
      case "goal-completed":
        return "🏆";
      case "milestone-completed":
        return "✅";
      default:
        return "•";
    }
  };

  // Generate calendar data based on view mode
  const getCalendarData = () => {
    switch (viewMode) {
      case "daily":
        return generateDailyView();
      case "weekly":
        return generateWeeklyView();
      case "monthly":
      default:
        return generateCalendarDays();
    }
  };

  const calendarDays = getCalendarData();
  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="goal-calendar">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button
          onClick={goToPrevious}
          className="calendar-nav-btn"
          title={`Previous ${
            viewMode === "daily"
              ? "day"
              : viewMode === "weekly"
              ? "week"
              : "month"
          }`}
        >
          ‹
        </button>
        <h3 className="calendar-title">
          {viewMode === "daily" &&
            currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          {viewMode === "weekly" &&
            `Week of ${currentDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}`}
          {viewMode === "monthly" &&
            `${getMonthName(currentMonth)} ${currentYear}`}
        </h3>
        <button
          onClick={goToNext}
          className="calendar-nav-btn"
          title={`Next ${
            viewMode === "daily"
              ? "day"
              : viewMode === "weekly"
              ? "week"
              : "month"
          }`}
        >
          ›
        </button>
      </div>

      {/* View Mode Selector */}
      <div className="view-mode-selector">
        <button
          onClick={() => setViewMode("daily")}
          className={`view-mode-btn ${viewMode === "daily" ? "active" : ""}`}
        >
          Daily
        </button>
        <button
          onClick={() => setViewMode("weekly")}
          className={`view-mode-btn ${viewMode === "weekly" ? "active" : ""}`}
        >
          Weekly
        </button>
        <button
          onClick={() => setViewMode("monthly")}
          className={`view-mode-btn ${viewMode === "monthly" ? "active" : ""}`}
        >
          Monthly
        </button>
        <button
          onClick={goToToday}
          className="view-mode-btn today-btn"
          title="Go to today"
        >
          Today
        </button>
      </div>

      {/* Calendar Summary */}
      <div className="calendar-summary">
        <div className="summary-item">
          <span className="summary-icon" style={{ backgroundColor: "#28a745" }}>
            🎯
          </span>
          <span className="summary-text">
            {
              goals.filter((g) => {
                // A goal is active if archived is explicitly false or undefined/null
                return (
                  g.archived === false ||
                  g.archived === null ||
                  g.archived === undefined
                );
              }).length
            }{" "}
            Active Goals
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon" style={{ backgroundColor: "#dc3545" }}>
            🏆
          </span>
          <span className="summary-text">
            {goals.filter((g) => g.archived === true).length} Completed Goals
          </span>
        </div>
        <div className="summary-item">
          <span className="summary-icon" style={{ backgroundColor: "#007bff" }}>
            ✅
          </span>
          <span className="summary-text">
            {goals.reduce(
              (sum, g) => sum + g.milestones.filter((m) => m.completed).length,
              0
            )}{" "}
            Milestones Completed
          </span>
        </div>
      </div>

      {/* Calendar Grid */}
      {viewMode === "daily" ? (
        // Daily view - show condensed single day with grouped events
        <div className="daily-view">
          <div className="daily-date-header">
            <h4>
              {currentDate.toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </h4>
          </div>
          <div className="daily-events">
            {getEventsForDate(currentDate).length === 0 ? (
              <p className="no-events">No events on this date</p>
            ) : (
              <div className="daily-events-grouped">
                {/* Group events by type */}
                {(() => {
                  const events = getEventsForDate(currentDate);
                  const groupedEvents = {
                    "goal-created": events.filter(
                      (e) => e.type === "goal-created"
                    ),
                    "milestone-completed": events.filter(
                      (e) => e.type === "milestone-completed"
                    ),
                    "goal-completed": events.filter(
                      (e) => e.type === "goal-completed"
                    ),
                  };

                  return Object.entries(groupedEvents)
                    .filter(([type, events]) => events.length > 0)
                    .map(([type, typeEvents]) => (
                      <div key={type} className="event-group">
                        <div className="event-group-header">
                          <span
                            className="event-group-icon"
                            style={{ backgroundColor: getEventColor(type) }}
                          >
                            {getEventIcon(type)}
                          </span>
                          <span className="event-group-title">
                            {type
                              .replace("-", " ")
                              .replace(/\b\w/g, (l) => l.toUpperCase())}
                            <span className="event-count">
                              ({typeEvents.length})
                            </span>
                          </span>
                          <button
                            className="event-group-toggle"
                            onClick={() => toggleEventGroup(type)}
                            aria-label={`Toggle ${type} events`}
                          >
                            {expandedGroups[type] ? "−" : "+"}
                          </button>
                        </div>
                        {expandedGroups[type] && (
                          <div className="event-group-content">
                            {typeEvents.map((event, index) => (
                              <div key={index} className="daily-event-card">
                                <div className="daily-event-header">
                                  {event.isArchived && (
                                    <span className="archived-badge-small">
                                      Archived
                                    </span>
                                  )}
                                </div>
                                <div className="daily-event-content">
                                  <span className="daily-event-title">
                                    {event.title}
                                  </span>
                                  {event.goal &&
                                    event.goal.title !== event.title && (
                                      <span className="daily-event-goal">
                                        From: {event.goal.title}
                                      </span>
                                    )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ));
                })()}
              </div>
            )}
          </div>
        </div>
      ) : (
        // Weekly/Monthly view - show traditional calendar grid
        <div className="calendar-grid">
          {/* Day headers */}
          {Array.from({ length: 7 }, (_, i) => (
            <div key={i} className="calendar-day-header">
              {getDayName(i)}
            </div>
          ))}

          {/* Calendar days */}
          {calendarDays.map((dayData, index) => (
            <div
              key={index}
              className={`calendar-day ${dayData.isEmpty ? "empty" : ""} ${
                selectedDate &&
                selectedDate.getDate() === dayData.day &&
                selectedDate.getMonth() === currentMonth
                  ? "selected"
                  : ""
              }`}
              onClick={() => !dayData.isEmpty && setSelectedDate(dayData.date)}
            >
              {!dayData.isEmpty && (
                <>
                  <span className="day-number">{dayData.day}</span>
                  <div className="day-events">
                    {getEventsForDate(dayData.date)
                      .slice(0, 3)
                      .map((event, eventIndex) => (
                        <div
                          key={eventIndex}
                          className={`day-event-indicator ${
                            event.isArchived ? "archived" : ""
                          }`}
                          style={{ backgroundColor: getEventColor(event.type) }}
                          title={`${event.type.replace("-", " ")}: ${
                            event.title
                          }${event.isArchived ? " (Archived)" : ""}`}
                        >
                          {getEventIcon(event.type)}
                        </div>
                      ))}
                    {getEventsForDate(dayData.date).length > 3 && (
                      <div className="day-event-more">
                        +{getEventsForDate(dayData.date).length - 3}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Selected Date Events - Only show for Weekly/Monthly views */}
      {selectedDate && viewMode !== "daily" && (
        <div className="selected-date-events">
          <h4 className="selected-date-title">
            {selectedDate.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </h4>
          {selectedDateEvents.length === 0 ? (
            <p className="no-events">No events on this date</p>
          ) : (
            <div className="daily-events-grouped">
              {/* Group events by type */}
              {(() => {
                const events = selectedDateEvents;
                const groupedEvents = {
                  "goal-created": events.filter(
                    (e) => e.type === "goal-created"
                  ),
                  "milestone-completed": events.filter(
                    (e) => e.type === "milestone-completed"
                  ),
                  "goal-completed": events.filter(
                    (e) => e.type === "goal-completed"
                  ),
                };

                return Object.entries(groupedEvents)
                  .filter(([type, events]) => events.length > 0)
                  .map(([type, typeEvents]) => (
                    <div key={type} className="event-group">
                      <div className="event-group-header">
                        <span
                          className="event-group-icon"
                          style={{ backgroundColor: getEventColor(type) }}
                        >
                          {getEventIcon(type)}
                        </span>
                        <span className="event-group-title">
                          {type
                            .replace("-", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                          <span className="event-count">
                            ({typeEvents.length})
                          </span>
                        </span>
                        <button
                          className="event-group-toggle"
                          onClick={() => toggleEventGroup(type)}
                          aria-label={`Toggle ${type} events`}
                        >
                          {expandedGroups[type] ? "−" : "+"}
                        </button>
                      </div>
                      {expandedGroups[type] && (
                        <div className="event-group-content">
                          {typeEvents.map((event, index) => (
                            <div key={index} className="daily-event-card">
                              <div className="daily-event-header">
                                {event.isArchived && (
                                  <span className="archived-badge-small">
                                    Archived
                                  </span>
                                )}
                              </div>
                              <div className="daily-event-content">
                                <span className="daily-event-title">
                                  {event.title}
                                </span>
                                {event.goal &&
                                  event.goal.title !== event.title && (
                                    <span className="daily-event-goal">
                                      From: {event.goal.title}
                                    </span>
                                  )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ));
              })()}
            </div>
          )}
        </div>
      )}

      {/* Calendar Legend */}
      <div className="calendar-legend">
        <div className="legend-item">
          <span className="legend-icon" style={{ backgroundColor: "#28a745" }}>
            🎯
          </span>
          <span>Goal Created</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ backgroundColor: "#007bff" }}>
            ✅
          </span>
          <span>Milestone Completed</span>
        </div>
        <div className="legend-item">
          <span className="legend-icon" style={{ backgroundColor: "#dc3545" }}>
            🏆
          </span>
          <span>Goal Completed</span>
        </div>
      </div>
    </div>
  );
}

export default GoalCalendar;
