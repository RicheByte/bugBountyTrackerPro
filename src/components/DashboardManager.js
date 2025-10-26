/**
 * DashboardManager.js
 * Manages the dashboard tab - project overview, quick actions, recent activity
 */

class DashboardManager {
    constructor(dashboardContainer) {
        this.container = dashboardContainer;
        this.currentProject = null;
        this.activities = [];
    }

    loadDashboard(project) {
        this.currentProject = project;
        this.activities = this.getRecentActivities();
        this.render();
        
        // Start auto-refresh for activity feed
        this.startAutoRefresh();
    }

    render() {
        if (!this.currentProject) {
            this.renderEmptyState();
            return;
        }

        const stats = this.calculateStats();
        const severityBreakdown = this.getSeverityBreakdown();

        this.container.innerHTML = `
            <div class="dashboard-content">
                <!-- Current Project Overview -->
                <div class="dashboard-section project-overview">
                    <div class="project-overview-header">
                        <div class="project-title">
                            <h2>📊 ${this.escapeHtml(this.currentProject.name)}</h2>
                            <span class="project-scope-badge">${this.getScopeLabel(this.currentProject.scope)}</span>
                        </div>
                        <div class="project-meta">
                            <span class="meta-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm3.5 7.5a.5.5 0 01.5.5v1a.5.5 0 01-.5.5h-4a.5.5 0 01-.5-.5V8a.5.5 0 01.5-.5h4z"/>
                                </svg>
                                ${this.currentProject.url || 'No URL'}
                            </span>
                            <span class="meta-item">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                                    <path d="M3.5 0a.5.5 0 01.5.5V1h8V.5a.5.5 0 011 0V1h1a2 2 0 012 2v11a2 2 0 01-2 2H2a2 2 0 01-2-2V3a2 2 0 012-2h1V.5a.5.5 0 01.5-.5z"/>
                                </svg>
                                Created ${this.formatDate(this.currentProject.createdAt)}
                            </span>
                        </div>
                    </div>

                    <!-- Stats Grid -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">✓</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.completedTasks}/${stats.totalTasks}</div>
                                <div class="stat-label">Tests Completed</div>
                            </div>
                            <div class="stat-progress">
                                <div class="progress-bar">
                                    <div class="progress-fill" style="width: ${stats.progress}%"></div>
                                </div>
                                <span class="progress-text">${stats.progress}%</span>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">📝</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.writeups}</div>
                                <div class="stat-label">Vulnerabilities Found</div>
                            </div>
                            <div class="stat-breakdown">
                                ${severityBreakdown}
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">🔄</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.workflows}</div>
                                <div class="stat-label">Active Workflows</div>
                            </div>
                        </div>

                        <div class="stat-card">
                            <div class="stat-icon">📋</div>
                            <div class="stat-content">
                                <div class="stat-value">${stats.notes}</div>
                                <div class="stat-label">Notes Saved</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-section quick-actions-section">
                    <h3>🎯 Quick Actions</h3>
                    <div class="quick-actions-grid">
                        <button class="action-card" data-action="continue-testing">
                            <div class="action-icon">▶️</div>
                            <div class="action-content">
                                <div class="action-title">Continue Testing</div>
                                <div class="action-description">Resume your checklist progress</div>
                            </div>
                        </button>

                        <button class="action-card" data-action="add-finding">
                            <div class="action-icon">🔍</div>
                            <div class="action-content">
                                <div class="action-title">Add Finding</div>
                                <div class="action-description">Document a vulnerability</div>
                            </div>
                        </button>

                        <button class="action-card" data-action="start-workflow">
                            <div class="action-icon">🚀</div>
                            <div class="action-content">
                                <div class="action-title">Start Workflow</div>
                                <div class="action-description">Run a testing workflow</div>
                            </div>
                        </button>

                        <button class="action-card" data-action="export-report">
                            <div class="action-icon">📄</div>
                            <div class="action-content">
                                <div class="action-title">Export Report</div>
                                <div class="action-description">Generate PDF report</div>
                            </div>
                        </button>

                        <button class="action-card" data-action="quick-note">
                            <div class="action-icon">✏️</div>
                            <div class="action-content">
                                <div class="action-title">Quick Note</div>
                                <div class="action-description">Jot down a quick thought</div>
                            </div>
                        </button>

                        <button class="action-card" data-action="view-findings">
                            <div class="action-icon">📊</div>
                            <div class="action-content">
                                <div class="action-title">View Findings</div>
                                <div class="action-description">Review all vulnerabilities</div>
                            </div>
                        </button>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-section recent-activity-section">
                    <h3>📈 Recent Activity</h3>
                    <div class="activity-list">
                        ${this.renderActivities()}
                    </div>
                </div>

                <!-- Testing Progress Tracker -->
                <div class="dashboard-section progress-tracker-section">
                    <h3>🗺️ Testing Progress</h3>
                    <div class="progress-wizard">
                        <div class="wizard-step ${this.getStepStatus('setup')}">
                            <div class="step-number">1</div>
                            <div class="step-label">Setup Project</div>
                            <div class="step-icon">✓</div>
                        </div>
                        <div class="wizard-connector"></div>
                        <div class="wizard-step ${this.getStepStatus('testing')}">
                            <div class="step-number">2</div>
                            <div class="step-label">Run Tests</div>
                            <div class="step-icon">${stats.progress > 0 ? '▶️' : '○'}</div>
                        </div>
                        <div class="wizard-connector"></div>
                        <div class="wizard-step ${this.getStepStatus('findings')}">
                            <div class="step-number">3</div>
                            <div class="step-label">Document Findings</div>
                            <div class="step-icon">${stats.writeups > 0 ? '▶️' : '🔒'}</div>
                        </div>
                        <div class="wizard-connector"></div>
                        <div class="wizard-step ${this.getStepStatus('export')}">
                            <div class="step-number">4</div>
                            <div class="step-label">Export Report</div>
                            <div class="step-icon">🔒</div>
                        </div>
                    </div>
                    <div class="wizard-hint">
                        ${this.getProgressHint(stats)}
                    </div>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    renderEmptyState() {
        this.container.innerHTML = `
            <div class="dashboard-empty-state">
                <div class="empty-state-icon">🎯</div>
                <h2>Welcome to Bug Bounty Tracker!</h2>
                <p>Get started by creating your first project or loading an existing one.</p>
                <div class="empty-state-actions">
                    <button class="btn btn-primary btn-lg" data-action="create-project">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M8 0a1 1 0 011 1v6h6a1 1 0 110 2H9v6a1 1 0 11-2 0V9H1a1 1 0 010-2h6V1a1 1 0 011-1z"/>
                        </svg>
                        Create Your First Project
                    </button>
                    <button class="btn btn-secondary btn-lg" data-action="load-project">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M2 2a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V2z"/>
                        </svg>
                        Load Existing Project
                    </button>
                </div>
                <div class="empty-state-hint">
                    <p>💡 <strong>Tip:</strong> Start with the guided project creation to set up your first security assessment.</p>
                </div>
            </div>
        `;

        this.bindEvents();
    }

    calculateStats() {
        if (!this.currentProject) return { totalTasks: 0, completedTasks: 0, progress: 0, writeups: 0, workflows: 0, notes: 0 };

        let totalTasks = 0;
        let completedTasks = 0;

        // Count checklist tasks
        if (this.currentProject.checklist) {
            this.currentProject.checklist.forEach(section => {
                if (section.tasks) {
                    totalTasks += section.tasks.length;
                    completedTasks += section.tasks.filter(t => t.completed).length;
                }
                if (section.subsections) {
                    section.subsections.forEach(subsection => {
                        totalTasks += subsection.tasks.length;
                        completedTasks += subsection.tasks.filter(t => t.completed).length;
                    });
                }
            });
        }

        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        return {
            totalTasks,
            completedTasks,
            progress,
            writeups: this.currentProject.writeups?.length || 0,
            workflows: this.currentProject.workflows?.length || 0,
            notes: this.currentProject.projectNotes?.length || 0
        };
    }

    getSeverityBreakdown() {
        if (!this.currentProject.writeups || this.currentProject.writeups.length === 0) {
            return '<span class="severity-empty">No findings yet</span>';
        }

        const severities = { critical: 0, high: 0, medium: 0, low: 0 };
        
        this.currentProject.writeups.forEach(writeup => {
            const score = writeup.cvssScore || 0;
            if (score >= 9.0) severities.critical++;
            else if (score >= 7.0) severities.high++;
            else if (score >= 4.0) severities.medium++;
            else severities.low++;
        });

        return `
            <div class="severity-badges" role="group" aria-label="Filter findings by severity">
                ${severities.critical > 0 ? `
                    <button type="button" 
                            class="severity-badge critical" 
                            data-severity="critical" 
                            title="Click to filter ${severities.critical} Critical findings"
                            aria-label="Show ${severities.critical} critical severity findings">
                        🔴 ${severities.critical}
                    </button>
                ` : ''}
                ${severities.high > 0 ? `
                    <button type="button" 
                            class="severity-badge high" 
                            data-severity="high" 
                            title="Click to filter ${severities.high} High findings"
                            aria-label="Show ${severities.high} high severity findings">
                        🟠 ${severities.high}
                    </button>
                ` : ''}
                ${severities.medium > 0 ? `
                    <button type="button" 
                            class="severity-badge medium" 
                            data-severity="medium" 
                            title="Click to filter ${severities.medium} Medium findings"
                            aria-label="Show ${severities.medium} medium severity findings">
                        🟡 ${severities.medium}
                    </button>
                ` : ''}
                ${severities.low > 0 ? `
                    <button type="button" 
                            class="severity-badge low" 
                            data-severity="low" 
                            title="Click to filter ${severities.low} Low findings"
                            aria-label="Show ${severities.low} low severity findings">
                        🟢 ${severities.low}
                    </button>
                ` : ''}
            </div>
        `;
    }

    getRecentActivities() {
        const activities = [];
        
        if (!this.currentProject) return activities;

        // Check for recent writeups
        if (this.currentProject.writeups && this.currentProject.writeups.length > 0) {
            this.currentProject.writeups.slice(-3).reverse().forEach(writeup => {
                activities.push({
                    type: 'writeup',
                    time: writeup.createdAt || this.currentProject.createdAt,
                    message: `📝 Documented: ${writeup.title || 'Vulnerability'}`,
                    severity: writeup.severity || 'medium'
                });
            });
        }

        // Check for completed tasks
        if (this.currentProject.checklist) {
            this.currentProject.checklist.forEach(section => {
                if (section.tasks) {
                    section.tasks.filter(t => t.completed).slice(-2).forEach(task => {
                        activities.push({
                            type: 'task',
                            time: new Date().toISOString(),
                            message: `✓ Completed: ${task.description.substring(0, 50)}${task.description.length > 50 ? '...' : ''}`
                        });
                    });
                }
            });
        }

        // Sort by time and limit to 5
        return activities.sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);
    }

    renderActivities() {
        if (this.activities.length === 0) {
            return `
                <div class="activity-empty">
                    <p>No recent activity yet. Start testing to see your progress here!</p>
                </div>
            `;
        }

        return this.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-time">${this.formatTime(activity.time)}</div>
                <div class="activity-message">${activity.message}</div>
            </div>
        `).join('');
    }

    startAutoRefresh() {
        // Clear existing interval if any
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
        
        // Auto-refresh every 2 minutes
        this.refreshInterval = setInterval(() => {
            // Only refresh if page is visible
            if (!document.hidden && this.currentProject) {
                this.refreshActivityFeed();
            }
        }, 2 * 60 * 1000); // 2 minutes
    }

    refreshActivityFeed() {
        const activityList = this.container.querySelector('.activity-list');
        if (!activityList) return;
        
        // Add updating indicator
        activityList.classList.add('updating');
        
        // Re-fetch activities
        this.activities = this.getRecentActivities();
        
        // Fade out, update, fade in
        setTimeout(() => {
            activityList.innerHTML = this.renderActivities();
            activityList.classList.remove('updating');
            
            // Update last updated timestamp
            const timestamp = this.container.querySelector('.last-updated');
            if (timestamp) {
                timestamp.textContent = `Last updated: ${new Date().toLocaleTimeString()}`;
            }
        }, 300);
    }

    destroy() {
        // Cleanup intervals to prevent memory leaks
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
        }
    }

    getStepStatus(step) {
        const stats = this.calculateStats();
        
        switch(step) {
            case 'setup':
                return 'completed';
            case 'testing':
                return stats.progress > 0 ? 'active' : 'pending';
            case 'findings':
                return stats.writeups > 0 ? 'active' : stats.progress > 50 ? 'pending' : 'locked';
            case 'export':
                return stats.progress === 100 ? 'pending' : 'locked';
            default:
                return 'pending';
        }
    }

    getProgressHint(stats) {
        if (stats.progress === 0) {
            return '💡 Get started by checking off tasks in the Checklist tab';
        } else if (stats.progress < 50) {
            return '🎯 Keep going! You\'re making great progress with your security assessment';
        } else if (stats.progress < 100) {
            return '🔥 Almost there! Don\'t forget to document any findings you\'ve discovered';
        } else if (stats.writeups === 0) {
            return '📝 Checklist complete! Now document your findings in the Writeups tab';
        } else {
            return '🏆 Great work! You can export your final report anytime';
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }

    getScopeLabel(scope) {
        const labels = {
            web: 'Web Application',
            mobile: 'Mobile App',
            api: 'API',
            network: 'Network'
        };
        return labels[scope] || scope;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    bindEvents() {
        // Quick actions
        this.container.querySelectorAll('[data-action]').forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this.handleAction(action);
            });
        });
        
        // Severity badge → filter findings (NEW!)
        this.container.querySelectorAll('.severity-badge[data-severity]').forEach(badge => {
            badge.addEventListener('click', (e) => {
                const severity = e.currentTarget.dataset.severity;
                
                // Visual feedback
                badge.classList.add('filter-active');
                setTimeout(() => badge.classList.remove('filter-active'), 300);
                
                const event = new CustomEvent('dashboard-action', {
                    detail: { 
                        action: 'filter-findings', 
                        payload: { severity } 
                    },
                    bubbles: true
                });
                this.container.dispatchEvent(event);
            });
        });
    }

    handleAction(action) {
        // Dispatch custom event for parent app to handle
        const event = new CustomEvent('dashboard-action', { 
            detail: { action },
            bubbles: true 
        });
        this.container.dispatchEvent(event);
    }
}

// Make it globally available
if (typeof window !== 'undefined') {
    window.DashboardManager = DashboardManager;
}
