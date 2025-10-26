const { ipcRenderer } = require('electron');
const fs = require('fs');

class BugBountyTracker {
    constructor() {
        this.projects = [];
        this.currentProject = null;
        this.currentNoteItem = null;
        this.checklistData = null;
        this.viewMode = 'tree'; // 'tree' or 'canvas'
        this.currentTab = 'dashboard';
        
        // Component instances
        this.writeupEditor = null;
        this.workflowBuilder = null;
        this.notesManager = null;
        this.dashboardManager = null;
        this.welcomeScreen = null;
        
        this.init();
    }

    async init() {
        // Load checklist data
        try {
            const response = await fetch('checklist-data.json');
            this.checklistData = await response.json();
        } catch (error) {
            console.error('Failed to load checklist data:', error);
        }

        // Initialize components
        this.initializeComponents();

        this.bindEvents();
        this.renderProjectsList();
        
        // Show welcome screen for first-time users
        this.showWelcomeIfNeeded();
    }

    initializeComponents() {
        // Initialize DashboardManager
        this.dashboardManager = new DashboardManager(
            document.getElementById('dashboardContainer')
        );

        // Initialize WelcomeScreen
        this.welcomeScreen = new WelcomeScreen();

        // Initialize WriteupManager
        this.writeupEditor = new WriteupManager(
            document.getElementById('writeupsContent'),
            document.getElementById('writeupsList')
        );

        // Initialize WorkflowManager
        this.workflowBuilder = new WorkflowManager(
            document.getElementById('workflowsContent'),
            document.getElementById('workflowsList')
        );

        // Initialize NotesManagerComponent
        this.notesManager = new NotesManagerComponent(
            document.getElementById('notesContent'),
            document.getElementById('notesList'),
            document.getElementById('notesSearch')
        );
    }

    bindEvents() {
        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.tab));
        });

        // Project management
        document.getElementById('createProject').addEventListener('click', () => this.createProject());
        document.getElementById('newProject').addEventListener('click', () => this.newProject());
        document.getElementById('saveProject').addEventListener('click', () => this.saveProject());
        document.getElementById('loadProject').addEventListener('click', () => this.loadProject());
        document.getElementById('exportPdf').addEventListener('click', () => this.exportPdf());

        // View controls
        document.getElementById('toggleView').addEventListener('click', () => this.toggleView());
        document.getElementById('expandAll').addEventListener('click', () => this.expandAll());
        document.getElementById('collapseAll').addEventListener('click', () => this.collapseAll());

        // Notes management (checklist task notes)
        document.getElementById('saveNote').addEventListener('click', () => this.saveNote());
        document.getElementById('clearNote').addEventListener('click', () => this.clearNote());
        document.getElementById('closeNotes').addEventListener('click', () => this.hideNotes());

        // Writeup buttons
        document.getElementById('newWriteup').addEventListener('click', () => this.createWriteup());

        // Workflow buttons
        document.getElementById('newWorkflow').addEventListener('click', () => this.createWorkflow());

        // Notes buttons
        document.getElementById('newNote').addEventListener('click', () => this.createNote());

        // Modal
        document.querySelector('.close').addEventListener('click', () => this.hideModal());
        window.addEventListener('click', (e) => {
            if (e.target === document.getElementById('projectModal')) {
                this.hideModal();
            }
        });

        // Dashboard actions
        document.addEventListener('dashboard-action', (e) => this.handleDashboardAction(e.detail.action, e.detail.payload));

        // Welcome screen actions
        document.addEventListener('welcome-action', (e) => this.handleWelcomeAction(e.detail.action));
        
        // Initialize keyboard shortcuts
        this.initKeyboardShortcuts();
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabName);
        });

        // Update tab panes
        document.querySelectorAll('.tab-pane').forEach(pane => {
            pane.classList.remove('active');
        });
        
        const targetTab = document.getElementById(`${tabName}Tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        this.currentTab = tabName;

        // Load data for the selected tab
        if (this.currentProject) {
            this.loadTabData(tabName);
        } else if (tabName === 'dashboard') {
            // Always render dashboard even without project
            this.dashboardManager.loadDashboard(null);
        }
    }

    loadTabData(tabName) {
        if (!this.currentProject) return;

        switch (tabName) {
            case 'dashboard':
                this.loadDashboard();
                break;
            case 'writeups':
                this.loadWriteups();
                break;
            case 'workflows':
                this.loadWorkflows();
                break;
            case 'notes':
                this.loadNotes();
                break;
        }
    }

    createProject() {
        const name = document.getElementById('projectName').value.trim();
        const url = document.getElementById('projectUrl').value.trim();
        const scope = document.getElementById('projectScope').value;

        if (!name) {
            alert('Please enter a project name');
            return;
        }

        const project = {
            id: Date.now().toString(),
            name,
            url,
            scope,
            createdAt: new Date().toISOString(),
            checklist: this.initializeChecklist(),
            notes: {}, // Checklist task notes
            writeups: [],
            workflows: [],
            projectNotes: [] // New notes feature
        };

        this.projects.push(project);
        this.currentProject = project;
        
        this.renderProjectsList();
        this.renderChecklist();
        this.loadDashboard();
        this.clearProjectForm();
        
        // Switch to dashboard tab
        this.switchTab('dashboard');
    }

    initializeChecklist() {
        // Deep clone the checklist data and add completion status
        return JSON.parse(JSON.stringify(this.checklistData.checklist)).map(section => ({
            ...section,
            expanded: false,
            tasks: section.tasks ? section.tasks.map(task => ({
                ...task,
                completed: false,
                notes: ''
            })) : [],
            subsections: section.subsections ? section.subsections.map(subsection => ({
                ...subsection,
                expanded: false,
                tasks: subsection.tasks.map(task => ({
                    ...task,
                    completed: false,
                    notes: ''
                }))
            })) : []
        }));
    }

    newProject() {
        this.currentProject = null;
        this.renderChecklist();
        document.getElementById('currentProjectName').textContent = 'No Project Selected';
    }

    async saveProject() {
        if (!this.currentProject) {
            alert('No project selected');
            return;
        }

        const result = await ipcRenderer.invoke('save-project', this.currentProject);
        if (result.success) {
            alert('Project saved successfully!');
        } else {
            alert('Failed to save project: ' + (result.error || 'Unknown error'));
        }
    }

    async loadProject() {
        const result = await ipcRenderer.invoke('load-project');
        if (result.success) {
            this.currentProject = result.data;
            this.renderProjectsList();
            this.renderChecklist();
            document.getElementById('currentProjectName').textContent = this.currentProject.name;
            alert('Project loaded successfully!');
        } else if (result.error) {
            alert('Failed to load project: ' + result.error);
        }
    }

    async exportPdf() {
        if (!this.currentProject) {
            alert('No project selected');
            return;
        }

        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        // Add title
        doc.setFontSize(20);
        doc.text(`Bug Bounty Report: ${this.currentProject.name}`, 20, 20);

        // Add project info
        doc.setFontSize(12);
        doc.text(`Target URL: ${this.currentProject.url}`, 20, 40);
        doc.text(`Scope: ${this.currentProject.scope}`, 20, 50);
        doc.text(`Created: ${new Date(this.currentProject.createdAt).toLocaleDateString()}`, 20, 60);

        let yPosition = 80;

        // Add checklist progress
        this.currentProject.checklist.forEach(section => {
            if (yPosition > 270) {
                doc.addPage();
                yPosition = 20;
            }

            doc.setFontSize(14);
            doc.setTextColor(255, 107, 53);
            doc.text(`${section.icon} ${section.title}`, 20, yPosition);
            yPosition += 10;

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(section.description, 20, yPosition);
            yPosition += 15;

            // Calculate progress
            const totalTasks = this.countTasks(section);
            const completedTasks = this.countCompletedTasks(section);
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            doc.setTextColor(0, 0, 0);
            doc.text(`Progress: ${completedTasks}/${totalTasks} (${progress.toFixed(1)}%)`, 20, yPosition);
            yPosition += 20;

            // Add notes if any
            const sectionNotes = this.getSectionNotes(section);
            if (sectionNotes) {
                doc.setTextColor(0, 0, 0);
                doc.text('Notes:', 25, yPosition);
                yPosition += 7;
                
                const splitNotes = doc.splitTextToSize(sectionNotes, 160);
                doc.text(splitNotes, 30, yPosition);
                yPosition += splitNotes.length * 5 + 10;
            }

            yPosition += 10;
        });

        const result = await ipcRenderer.invoke('export-pdf', {
            projectName: this.currentProject.name
        });

        if (result.success) {
            doc.save(result.path);
            alert('PDF exported successfully!');
        } else {
            // Fallback: download directly
            doc.save(`${this.currentProject.name}_report.pdf`);
        }
    }

    countTasks(section) {
        let count = section.tasks ? section.tasks.length : 0;
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                count += subsection.tasks.length;
            });
        }
        return count;
    }

    countCompletedTasks(section) {
        let count = 0;
        
        if (section.tasks) {
            count += section.tasks.filter(task => task.completed).length;
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                count += subsection.tasks.filter(task => task.completed).length;
            });
        }
        
        return count;
    }

    getSectionNotes(section) {
        const notes = [];
        
        if (section.tasks) {
            section.tasks.forEach(task => {
                if (task.notes) notes.push(`• ${task.description}: ${task.notes}`);
            });
        }
        
        if (section.subsections) {
            section.subsections.forEach(subsection => {
                subsection.tasks.forEach(task => {
                    if (task.notes) notes.push(`• ${task.description}: ${task.notes}`);
                });
            });
        }
        
        return notes.join('\n');
    }

    renderProjectsList() {
        const container = document.getElementById('projectsList');
        container.innerHTML = '';

        this.projects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = `project-item ${this.currentProject?.id === project.id ? 'active' : ''}`;
            projectEl.innerHTML = `
                <strong>${project.name}</strong><br>
                <small>${project.url}</small>
            `;
            projectEl.addEventListener('click', () => this.selectProject(project));
            container.appendChild(projectEl);
        });
    }

    selectProject(project) {
        this.currentProject = project;
        this.renderProjectsList();
        this.renderChecklist();
        this.loadDashboard();
        document.getElementById('currentProjectName').textContent = project.name;
    }

    renderChecklist() {
        const container = document.getElementById('canvasContainer');
        
        if (!this.currentProject) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📋</div>
                    <h3>No Project Selected</h3>
                    <p>Create or select a project to start your security testing checklist</p>
                    <div class="empty-state-actions">
                        <button class="btn btn-primary" onclick="document.getElementById('projectName').focus()">
                            Create New Project
                        </button>
                        <button class="btn btn-secondary" onclick="document.getElementById('loadProject').click()">
                            Load Project
                        </button>
                    </div>
                    <div class="empty-state-hint">
                        <p><strong>💡 Tip:</strong> The checklist helps you systematically test for vulnerabilities based on industry standards.</p>
                    </div>
                </div>
            `;
            return;
        }

        if (this.viewMode === 'tree') {
            this.renderTreeView(container);
        } else {
            this.renderCanvasView(container);
        }
    }

    renderTreeView(container) {
        container.innerHTML = '<div class="checklist-tree" id="checklistTree"></div>';
        const treeContainer = document.getElementById('checklistTree');

        this.currentProject.checklist.forEach((section, sectionIndex) => {
            const sectionEl = document.createElement('div');
            sectionEl.className = 'checklist-section';
            
            const totalTasks = this.countTasks(section);
            const completedTasks = this.countCompletedTasks(section);
            const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

            sectionEl.innerHTML = `
                <div class="section-header collapsible ${section.expanded ? 'expanded' : ''}" 
                     data-section="${sectionIndex}">
                    <span class="section-icon">${section.icon}</span>
                    <h3>${section.title}</h3>
                    <span style="margin-left: auto; font-size: 0.8rem; color: #aaa;">
                        ${completedTasks}/${totalTasks}
                    </span>
                </div>
                <div class="section-content" style="display: ${section.expanded ? 'block' : 'none'}">
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress}%"></div>
                    </div>
                    <p>${section.description}</p>
                    ${this.renderSectionContent(section, sectionIndex)}
                </div>
            `;

            treeContainer.appendChild(sectionEl);
        });

        this.bindChecklistEvents();
    }

    renderSectionContent(section, sectionIndex) {
        let html = '';

        // Render tasks directly under section
        if (section.tasks && section.tasks.length > 0) {
            html += '<div class="tasks-list">';
            section.tasks.forEach((task, taskIndex) => {
                html += this.renderTaskItem(task, sectionIndex, taskIndex);
            });
            html += '</div>';
        }

        // Render subsections
        if (section.subsections && section.subsections.length > 0) {
            section.subsections.forEach((subsection, subsectionIndex) => {
                html += `
                    <div class="subsection">
                        <div class="subsection-header collapsible ${subsection.expanded ? 'expanded' : ''}"
                             data-section="${sectionIndex}" data-subsection="${subsectionIndex}">
                            <h4>${subsection.title}</h4>
                        </div>
                        <div class="subsection-content" style="display: ${subsection.expanded ? 'block' : 'none'}">
                            <div class="tasks-list">
                                ${subsection.tasks.map((task, taskIndex) => 
                                    this.renderTaskItem(task, sectionIndex, subsectionIndex, taskIndex)
                                ).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        return html;
    }

    renderTaskItem(task, sectionIndex, subsectionIndex, taskIndex = null) {
        const hasSubsection = taskIndex !== null;
        const taskId = hasSubsection ? 
            `${sectionIndex}-${subsectionIndex}-${taskIndex}` : 
            `${sectionIndex}-${subsectionIndex}`;

        return `
            <div class="task-item">
                <input type="checkbox" class="task-checkbox" 
                       ${task.completed ? 'checked' : ''}
                       data-task="${taskId}">
                <div class="task-content">
                    <div class="task-description">
                        <strong>${task.id}</strong>: ${task.description}
                    </div>
                    ${task.notes ? `<div class="task-notes">📝 ${task.notes}</div>` : ''}
                    <button class="add-note-btn" data-task="${taskId}">
                        ${task.notes ? 'Edit Note' : 'Add Note'}
                    </button>
                </div>
            </div>
        `;
    }

    renderCanvasView(container) {
        // Simplified canvas view - you can enhance this with actual canvas drawing
        container.innerHTML = `
            <div style="padding: 2rem; text-align: center;">
                <h3>Canvas View</h3>
                <p>This view would show the checklist as an interactive graph/mind map.</p>
                <p>Work in progress - currently showing tree view.</p>
            </div>
        `;
        this.renderTreeView(container); // Fallback to tree view for now
    }

    bindChecklistEvents() {
        // Section headers
        document.querySelectorAll('.section-header.collapsible').forEach(header => {
            header.addEventListener('click', (e) => {
                const sectionIndex = parseInt(header.dataset.section);
                this.toggleSection(sectionIndex);
            });
        });

        // Subsection headers
        document.querySelectorAll('.subsection-header.collapsible').forEach(header => {
            header.addEventListener('click', (e) => {
                e.stopPropagation();
                const sectionIndex = parseInt(header.dataset.section);
                const subsectionIndex = parseInt(header.dataset.subsection);
                this.toggleSubsection(sectionIndex, subsectionIndex);
            });
        });

        // Task checkboxes
        document.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskId = checkbox.dataset.task;
                this.toggleTask(taskId, checkbox.checked);
            });
        });

        // Note buttons
        document.querySelectorAll('.add-note-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const taskId = button.dataset.task;
                this.showNotesPanel(taskId);
            });
        });
    }

    toggleSection(sectionIndex) {
        this.currentProject.checklist[sectionIndex].expanded = 
            !this.currentProject.checklist[sectionIndex].expanded;
        this.renderChecklist();
    }

    toggleSubsection(sectionIndex, subsectionIndex) {
        this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].expanded = 
            !this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].expanded;
        this.renderChecklist();
    }

    toggleTask(taskId, completed) {
        const [sectionIndex, subsectionIndex, taskIndex] = taskId.split('-').map(Number);
        
        if (taskIndex !== undefined) {
            // Task in subsection
            this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex].completed = completed;
        } else {
            // Task directly in section
            this.currentProject.checklist[sectionIndex].tasks[subsectionIndex].completed = completed;
        }
        
        this.renderChecklist();
    }

    showNotesPanel(taskId) {
        if (!this.currentProject) {
            alert('Please select a project first');
            return;
        }
        
        this.currentNoteItem = taskId;
        const [sectionIndex, subsectionIndex, taskIndex] = taskId.split('-').map(Number);
        
        let task;
        try {
            if (taskIndex !== undefined) {
                // Task in subsection
                task = this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex];
            } else {
                // Task directly in section
                task = this.currentProject.checklist[sectionIndex].tasks[subsectionIndex];
            }

            const notesEditor = document.getElementById('notesEditor');
            const notesPanel = document.getElementById('notesPanel');
            
            if (notesEditor && notesPanel && task) {
                notesEditor.value = task.notes || '';
                notesPanel.style.display = 'flex';
            } else {
                console.error('Notes panel elements not found or task is undefined');
            }
        } catch (error) {
            console.error('Error showing notes panel:', error);
            alert('Error opening notes panel. Please try again.');
        }
    }

    hideNotes() {
        document.getElementById('notesPanel').style.display = 'none';
        this.currentNoteItem = null;
    }

    saveNote() {
        if (!this.currentNoteItem) {
            alert('No note selected');
            return;
        }
        
        if (!this.currentProject) {
            alert('No project selected');
            return;
        }

        try {
            const note = document.getElementById('notesEditor').value.trim();
            const [sectionIndex, subsectionIndex, taskIndex] = this.currentNoteItem.split('-').map(Number);

            if (taskIndex !== undefined) {
                // Task in subsection
                this.currentProject.checklist[sectionIndex].subsections[subsectionIndex].tasks[taskIndex].notes = note;
            } else {
                // Task directly in section
                this.currentProject.checklist[sectionIndex].tasks[subsectionIndex].notes = note;
            }

            this.renderChecklist();
            this.hideNotes();
            alert('Note saved successfully!');
        } catch (error) {
            console.error('Error saving note:', error);
            alert('Error saving note. Please try again.');
        }
    }

    clearNote() {
        document.getElementById('notesEditor').value = '';
    }

    toggleView() {
        this.viewMode = this.viewMode === 'tree' ? 'canvas' : 'tree';
        this.renderChecklist();
    }

    expandAll() {
        this.currentProject.checklist.forEach(section => {
            section.expanded = true;
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    subsection.expanded = true;
                });
            }
        });
        this.renderChecklist();
    }

    collapseAll() {
        this.currentProject.checklist.forEach(section => {
            section.expanded = false;
            if (section.subsections) {
                section.subsections.forEach(subsection => {
                    subsection.expanded = false;
                });
            }
        });
        this.renderChecklist();
    }

    // ========== Writeups Methods ==========
    loadWriteups() {
        if (!this.currentProject || !this.currentProject.writeups) {
            this.currentProject.writeups = [];
        }
        this.writeupEditor.loadWriteups(
            this.currentProject.writeups,
            (writeups) => {
                this.currentProject.writeups = writeups;
            }
        );
    }

    createWriteup() {
        if (!this.currentProject) {
            alert('Please select or create a project first');
            this.switchTab('dashboard');
            return;
        }
        this.writeupEditor.createNew();
    }

    // ========== Workflows Methods ==========
    loadWorkflows() {
        if (!this.currentProject || !this.currentProject.workflows) {
            this.currentProject.workflows = [];
        }
        this.workflowBuilder.loadWorkflows(
            this.currentProject.workflows,
            (workflows) => {
                this.currentProject.workflows = workflows;
            }
        );
    }

    createWorkflow() {
        if (!this.currentProject) {
            alert('Please select or create a project first');
            this.switchTab('dashboard');
            return;
        }
        this.workflowBuilder.createNew();
    }

    // ========== Notes Methods ==========
    loadNotes() {
        if (!this.currentProject || !this.currentProject.projectNotes) {
            this.currentProject.projectNotes = [];
        }
        this.notesManager.loadNotes(
            this.currentProject.projectNotes,
            (notes) => {
                this.currentProject.projectNotes = notes;
            }
        );
    }

    createNote() {
        if (!this.currentProject) {
            alert('Please select or create a project first');
            this.switchTab('dashboard');
            return;
        }
        this.notesManager.createNew();
    }

    // ========== Dashboard Methods ==========
    loadDashboard() {
        this.dashboardManager.loadDashboard(this.currentProject);
    }

    handleDashboardAction(action, payload = {}) {
        switch(action) {
            case 'continue-testing':
                this.saveLastAction('continue-testing');
                this.switchTab('checklist');
                break;
            case 'add-finding':
                this.saveLastAction('add-finding');
                this.switchTab('writeups');
                this.createWriteup();
                break;
            case 'start-workflow':
                this.saveLastAction('start-workflow');
                this.switchTab('workflows');
                break;
            case 'export-report':
                this.saveLastAction('export-report');
                this.exportPdf();
                break;
            case 'quick-note':
                this.saveLastAction('quick-note');
                this.switchTab('notes');
                this.createNote();
                break;
            case 'view-findings':
                this.saveLastAction('view-findings');
                this.switchTab('writeups');
                break;
            case 'filter-findings':
                if (payload && payload.severity) {
                    this.saveLastAction('filter-findings', payload.severity);
                    this.switchTab('writeups');
                    this.applyWriteupsSeverityFilter(payload.severity);
                }
                break;
            case 'create-project':
                document.getElementById('projectName').focus();
                break;
            case 'load-project':
                this.loadProject();
                break;
        }
    }

    // ========== Welcome Screen Methods ==========
    showWelcomeIfNeeded() {
        if (this.welcomeScreen && this.welcomeScreen.shouldShow()) {
            this.welcomeScreen.show();
        }
    }

    handleWelcomeAction(action) {
        switch(action) {
            case 'create-project':
                document.getElementById('projectName').focus();
                break;
            case 'load-project':
                this.loadProject();
                break;
            case 'load-sample':
                this.loadSampleProject();
                break;
        }
    }

    loadSampleProject() {
        // Create a sample project for demonstration
        const sampleProject = {
            id: 'sample-' + Date.now().toString(),
            name: 'Example Web App (Sample)',
            url: 'https://example.com',
            scope: 'web',
            createdAt: new Date().toISOString(),
            checklist: this.initializeChecklist(),
            notes: {},
            writeups: [
                {
                    id: 'sample-writeup-1',
                    title: 'Cross-Site Scripting (XSS) in Search',
                    severity: 'High',
                    cvssScore: 7.5,
                    description: 'The search functionality is vulnerable to reflected XSS attacks.',
                    impact: 'An attacker can execute arbitrary JavaScript in the context of the victim\'s browser.',
                    reproduction: '1. Navigate to search page\\n2. Enter: <script>alert(1)</script>\\n3. XSS triggers',
                    mitigation: 'Implement proper input validation and output encoding.',
                    createdAt: new Date().toISOString(),
                    status: 'draft'
                }
            ],
            workflows: [],
            projectNotes: [
                {
                    id: 'sample-note-1',
                    title: 'Initial Reconnaissance',
                    content: 'Found several interesting subdomains during enumeration.',
                    tags: ['recon', 'enumeration'],
                    createdAt: new Date().toISOString()
                }
            ]
        };

        // Mark some checklist items as complete
        if (sampleProject.checklist.length > 0) {
            if (sampleProject.checklist[0].tasks && sampleProject.checklist[0].tasks.length > 0) {
                sampleProject.checklist[0].tasks[0].completed = true;
                sampleProject.checklist[0].tasks[0].notes = 'Completed reconnaissance phase';
            }
        }

        this.projects.push(sampleProject);
        this.currentProject = sampleProject;
        
        this.renderProjectsList();
        this.renderChecklist();
        this.loadDashboard();
        
        document.getElementById('currentProjectName').textContent = sampleProject.name;
        this.switchTab('dashboard');
        
        alert('Sample project loaded! Explore the different tabs to see how everything works.');
    }

    clearProjectForm() {
        document.getElementById('projectName').value = '';
        document.getElementById('projectUrl').value = '';
        document.getElementById('projectScope').value = 'web';
    }

    showModal() {
        document.getElementById('projectModal').style.display = 'block';
    }

    hideModal() {
        document.getElementById('projectModal').style.display = 'none';
    }

    // ========== Keyboard Shortcuts ==========
    initKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl+Alt combination
            if (e.ctrlKey && e.altKey) {
                // Don't trigger if user is typing in an input
                const activeElement = document.activeElement;
                if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA' || activeElement.isContentEditable)) {
                    return;
                }

                let handled = false;
                
                switch(e.key.toLowerCase()) {
                    case 't': // Testing (Checklist)
                        if (this.currentProject) {
                            this.switchTab('checklist');
                            this.showToast('Switched to Testing Checklist', 'success');
                            handled = true;
                        }
                        break;
                    case 'f': // Findings (Writeups)
                        if (this.currentProject) {
                            this.switchTab('writeups');
                            this.showToast('Switched to Findings', 'success');
                            handled = true;
                        }
                        break;
                    case 'w': // Workflows
                        if (this.currentProject) {
                            this.switchTab('workflows');
                            this.showToast('Switched to Workflows', 'success');
                            handled = true;
                        }
                        break;
                    case 'e': // Export
                        if (this.currentProject) {
                            this.exportPdf();
                            this.showToast('Exporting report...', 'info');
                            handled = true;
                        }
                        break;
                    case 'n': // New (context-aware)
                        if (this.currentProject) {
                            switch(this.currentTab) {
                                case 'writeups':
                                    this.createWriteup();
                                    this.showToast('Creating new finding...', 'success');
                                    break;
                                case 'workflows':
                                    this.createWorkflow();
                                    this.showToast('Creating new workflow...', 'success');
                                    break;
                                case 'notes':
                                    this.createNote();
                                    this.showToast('Creating new note...', 'success');
                                    break;
                            }
                            handled = true;
                        }
                        break;
                    case 'v': // View Dashboard
                        this.switchTab('dashboard');
                        this.showToast('Switched to Dashboard', 'success');
                        handled = true;
                        break;
                    case '/':
                    case '?': // Show keyboard shortcuts help
                        this.showKeyboardShortcuts();
                        handled = true;
                        break;
                }

                if (handled) {
                    e.preventDefault();
                }
            }
        });
    }

    showKeyboardShortcuts() {
        const existingOverlay = document.querySelector('.shortcuts-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
            return;
        }

        const overlay = document.createElement('div');
        overlay.className = 'shortcuts-overlay';
        overlay.innerHTML = `
            <div class="shortcuts-content">
                <div class="shortcuts-header">
                    <h2>⌨️ Keyboard Shortcuts</h2>
                    <button class="shortcuts-close" aria-label="Close shortcuts">&times;</button>
                </div>
                <div class="shortcuts-body">
                    <div class="shortcut-section">
                        <h3>Navigation</h3>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>V</kbd>
                            <span>View Dashboard</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>T</kbd>
                            <span>Testing Checklist</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>F</kbd>
                            <span>Findings (Writeups)</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>W</kbd>
                            <span>Workflows</span>
                        </div>
                    </div>
                    <div class="shortcut-section">
                        <h3>Actions</h3>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>N</kbd>
                            <span>New Item (context-aware)</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>E</kbd>
                            <span>Export Report</span>
                        </div>
                        <div class="shortcut-item">
                            <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>?</kbd>
                            <span>Show/Hide Shortcuts</span>
                        </div>
                    </div>
                </div>
                <div class="shortcuts-footer">
                    <p>Shortcuts work when not typing in an input field</p>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close button handler
        overlay.querySelector('.shortcuts-close').addEventListener('click', () => {
            overlay.remove();
        });

        // Click outside to close
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.remove();
            }
        });

        // Escape key to close
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                overlay.remove();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }

    // ========== Severity Filter ==========
    applyWriteupsSeverityFilter(severity) {
        if (!this.currentProject || !this.currentProject.writeups) {
            return;
        }

        // Map severity to CVSS score ranges
        const severityRanges = {
            'critical': { min: 9.0, max: 10.0, label: 'Critical' },
            'high': { min: 7.0, max: 8.9, label: 'High' },
            'medium': { min: 4.0, max: 6.9, label: 'Medium' },
            'low': { min: 0.0, max: 3.9, label: 'Low' }
        };

        const range = severityRanges[severity.toLowerCase()];
        if (!range) {
            this.showToast('Invalid severity filter', 'error');
            return;
        }

        // Filter writeups by CVSS score or severity text
        const filteredWriteups = this.currentProject.writeups.filter(writeup => {
            const score = parseFloat(writeup.cvssScore) || 0;
            const matchesScore = score >= range.min && score <= range.max;
            const matchesText = writeup.severity && writeup.severity.toLowerCase() === severity.toLowerCase();
            return matchesScore || matchesText;
        });

        // If the writeupEditor has a native filter method, use it
        if (this.writeupEditor && typeof this.writeupEditor.filterBySeverity === 'function') {
            this.writeupEditor.filterBySeverity(severity);
        } else {
            // Otherwise, reload with filtered list
            this.writeupEditor.loadWriteups(
                filteredWriteups,
                (writeups) => {
                    this.currentProject.writeups = this.currentProject.writeups; // Keep original
                }
            );
        }

        // Show active filter indicator
        this.showFilterChip(range.label);
        this.showToast(`Filtering ${filteredWriteups.length} ${range.label} severity findings`, 'info');
    }

    showFilterChip(severityLabel) {
        // Remove existing chip
        const existingChip = document.querySelector('.filter-chip');
        if (existingChip) {
            existingChip.remove();
        }

        // Create new chip
        const chip = document.createElement('div');
        chip.className = 'filter-chip';
        chip.innerHTML = `
            <span>Filtered: ${severityLabel}</span>
            <button class="filter-chip-close" aria-label="Clear filter" title="Clear filter">&times;</button>
        `;

        const writeupsTab = document.getElementById('writeupsTab');
        if (writeupsTab) {
            writeupsTab.insertBefore(chip, writeupsTab.firstChild);

            // Close button handler
            chip.querySelector('.filter-chip-close').addEventListener('click', () => {
                chip.remove();
                this.loadWriteups(); // Reload all writeups
                this.showToast('Filter cleared', 'success');
            });
        }
    }

    // ========== Toast Notifications ==========
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        
        const icons = {
            success: '✓',
            error: '✗',
            info: 'ℹ',
            warning: '⚠'
        };
        
        toast.innerHTML = `
            <span class="toast-icon">${icons[type] || icons.info}</span>
            <span class="toast-message">${message}</span>
        `;

        document.body.appendChild(toast);

        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 10);

        // Auto-hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========== Last Action Resume ==========
    saveLastAction(actionType, data = null) {
        if (!this.currentProject) return;

        const lastAction = {
            type: actionType,
            data: data,
            timestamp: Date.now(),
            project: this.currentProject.id
        };

        try {
            localStorage.setItem('hackerNotes_lastAction', JSON.stringify(lastAction));
        } catch (error) {
            console.error('Failed to save last action:', error);
        }
    }

    loadLastAction() {
        try {
            const stored = localStorage.getItem('hackerNotes_lastAction');
            if (stored) {
                const lastAction = JSON.parse(stored);
                
                // Check if action is less than 24 hours old
                const hoursSince = (Date.now() - lastAction.timestamp) / (1000 * 60 * 60);
                if (hoursSince < 24 && lastAction.project === this.currentProject?.id) {
                    return lastAction;
                }
            }
        } catch (error) {
            console.error('Failed to load last action:', error);
        }
        return null;
    }

    resumeLastAction() {
        const lastAction = this.loadLastAction();
        if (!lastAction) {
            this.showToast('No recent action to resume', 'info');
            return;
        }

        // Resume the action
        switch(lastAction.type) {
            case 'continue-testing':
                this.switchTab('checklist');
                this.showToast('Resumed testing checklist', 'success');
                break;
            case 'add-finding':
            case 'view-findings':
                this.switchTab('writeups');
                this.showToast('Resumed findings review', 'success');
                break;
            case 'filter-findings':
                if (lastAction.data) {
                    this.switchTab('writeups');
                    this.applyWriteupsSeverityFilter(lastAction.data);
                }
                break;
            case 'start-workflow':
                this.switchTab('workflows');
                this.showToast('Resumed workflow', 'success');
                break;
            case 'quick-note':
                this.switchTab('notes');
                this.showToast('Resumed notes', 'success');
                break;
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new BugBountyTracker();
});