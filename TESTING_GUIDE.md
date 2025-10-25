# Bug Bounty Tracker Pro - Testing Guide

**Date:** October 26, 2025  
**Version:** 2.0.0  
**Status:** Ready for Testing

---

## 🚀 Quick Start

### Running the Application

```bash
cd hackerNotes
npm install  # If not already done
npm start
```

The application should launch in an Electron window.

---

## ✅ Test Plan

### Phase 1: Basic Functionality

#### 1.1 Project Management
- [ ] Click "Create Project" in the sidebar
- [ ] Enter project details:
  - Name: "Test Target"
  - URL: "https://example.com"
  - Scope: "Web Application"
- [ ] Click "Create Project" button
- [ ] Verify project appears in sidebar
- [ ] Verify project name appears in header

#### 1.2 Tab Navigation
- [ ] Click "Checklist" tab → Should show checklist
- [ ] Click "Writeups" tab → Should show writeups interface
- [ ] Click "Workflows" tab → Should show workflows interface
- [ ] Click "Notes" tab → Should show notes interface
- [ ] Verify tab highlighting works correctly
- [ ] Verify content switches properly

---

### Phase 2: Writeups Feature

#### 2.1 Create Writeup
- [ ] Go to "Writeups" tab
- [ ] Click "+ New" button
- [ ] Verify writeup editor appears
- [ ] Verify default writeup in list

#### 2.2 Edit Writeup
- [ ] Change title to "SQL Injection in Login Form"
- [ ] Change severity to "High"
- [ ] Add description: "SQL injection vulnerability found in login endpoint"
- [ ] Add reproduction steps:
  - Step 1: "Navigate to /login"
  - Step 2: "Enter ' OR '1'='1 in username field"
  - Step 3: "Click login"
- [ ] Click "+ Add Step" to add more steps
- [ ] Add impact: "Attacker can bypass authentication"
- [ ] Add remediation: "Use parameterized queries"
- [ ] Add reference: "https://owasp.org/www-community/attacks/SQL_Injection"
- [ ] Click "+ Add Reference" to add more
- [ ] Click "Save" button
- [ ] Verify changes reflected in sidebar

#### 2.3 Multiple Writeups
- [ ] Click "+ New" to create second writeup
- [ ] Title: "XSS in Comment Section"
- [ ] Severity: "Medium"
- [ ] Save writeup
- [ ] Click between writeups in sidebar
- [ ] Verify correct writeup loads

#### 2.4 Delete Writeup
- [ ] Select a writeup
- [ ] Click "Delete" button
- [ ] Confirm deletion
- [ ] Verify writeup removed from list

#### 2.5 Export Writeup
- [ ] Select a writeup
- [ ] Click "Export" button
- [ ] Verify markdown file downloads
- [ ] Open file and verify content

---

### Phase 3: Workflows Feature

#### 3.1 Create Workflow
- [ ] Go to "Workflows" tab
- [ ] Click "+ New" button
- [ ] Verify workflow builder appears
- [ ] Verify default workflow in list

#### 3.2 Edit Workflow
- [ ] Change title to "Web App Reconnaissance"
- [ ] Add description: "Initial reconnaissance workflow for web applications"
- [ ] Edit first step:
  - Title: "Subdomain Enumeration"
  - Description: "Find all subdomains using amass"
  - Mark as action type
- [ ] Click "+ Action" to add new action step
- [ ] Click "+ Check" to add validation step
- [ ] Click "+ Note" to add documentation step
- [ ] Click "Save" button

#### 3.3 Step Management
- [ ] Add 5-6 steps total
- [ ] Mark some steps as completed (checkboxes)
- [ ] Verify progress bar updates in sidebar
- [ ] Delete a step using "Delete" button
- [ ] Verify step numbering updates

#### 3.4 Multiple Workflows
- [ ] Create "API Testing" workflow
- [ ] Create "Mobile App Testing" workflow
- [ ] Switch between workflows
- [ ] Verify correct workflow loads

#### 3.5 Export Workflow
- [ ] Select a workflow
- [ ] Click "Export" button
- [ ] Verify markdown file downloads
- [ ] Check file contains all steps

---

### Phase 4: Notes Feature

#### 4.1 Create Note
- [ ] Go to "Notes" tab
- [ ] Click "+ New" button
- [ ] Verify note editor appears
- [ ] Verify default note in list

#### 4.2 Edit Note
- [ ] Change title to "Reconnaissance Findings"
- [ ] Add content:
```
# Initial Scan Results

## Subdomains Found
- app.example.com
- api.example.com
- admin.example.com

## Technologies Detected
- nginx
- PHP 7.4
- MySQL
```
- [ ] Add tags: "recon, subdomains, tech-stack"
- [ ] Press Enter or click away to save tags
- [ ] Verify tags appear as chips
- [ ] Click "Save" button

#### 4.3 Formatting Tools
- [ ] Select text and click "B" (Bold) button
- [ ] Test Italic button
- [ ] Test H1, H2, H3 buttons
- [ ] Test bullet list button
- [ ] Test numbered list button
- [ ] Test code button
- [ ] Verify formatting applied to textarea

#### 4.4 Tag Management
- [ ] Add multiple tags
- [ ] Remove a tag by clicking × button
- [ ] Verify tag removed from list

#### 4.5 Pin/Unpin Notes
- [ ] Click pin icon (📍) on a note in sidebar
- [ ] Verify note moves to top with 📌 icon
- [ ] Click pin again to unpin
- [ ] Create multiple notes and pin some
- [ ] Verify pinned notes stay at top

#### 4.6 Search Notes
- [ ] Create 5+ notes with different content
- [ ] Type in search box at top of notes sidebar
- [ ] Verify matching notes appear
- [ ] Verify non-matching notes hidden
- [ ] Clear search
- [ ] Verify all notes reappear

#### 4.7 Export Note
- [ ] Select a note
- [ ] Click "Export" button
- [ ] Verify markdown file downloads
- [ ] Check file contains title, tags, and content

---

### Phase 5: Data Persistence

#### 5.1 Save Project
- [ ] Create project with writeups, workflows, and notes
- [ ] Click "Save Project" in header
- [ ] Choose location and save as "test-project.json"
- [ ] Verify success message
- [ ] Open saved JSON file
- [ ] Verify contains all data:
  - Checklist (existing)
  - Writeups array
  - Workflows array
  - ProjectNotes array

#### 5.2 Load Project
- [ ] Click "New Project" to clear current data
- [ ] Click "Load Project"
- [ ] Select previously saved JSON file
- [ ] Verify project loads correctly
- [ ] Check all tabs have correct data:
  - [ ] Writeups preserved
  - [ ] Workflows preserved
  - [ ] Notes preserved

#### 5.3 Project Switching
- [ ] Create multiple projects
- [ ] Switch between them in sidebar
- [ ] Verify each project's data loads correctly in all tabs

---

### Phase 6: Integration Testing

#### 6.1 Complete Workflow
- [ ] Create new project: "BugCrowd Target"
- [ ] Go to Checklist tab
- [ ] Check off some checklist items
- [ ] Go to Workflows tab
- [ ] Create "Initial Recon" workflow with 10 steps
- [ ] Complete 5 steps
- [ ] Go to Writeups tab
- [ ] Create 3 vulnerability writeups
- [ ] Go to Notes tab
- [ ] Create 5 notes documenting findings
- [ ] Add relevant tags to notes
- [ ] Save entire project
- [ ] Reload application
- [ ] Load project
- [ ] Verify everything persisted

#### 6.2 Export Everything
- [ ] Export each writeup individually
- [ ] Export each workflow individually
- [ ] Export each note individually
- [ ] Click "Export PDF" in header
- [ ] Verify PDF contains checklist progress

---

### Phase 7: UI/UX Testing

#### 7.1 Visual Design
- [ ] Verify tabs look good and are clickable
- [ ] Check sidebar colors and highlighting
- [ ] Verify empty states show properly
- [ ] Check button styles (primary, secondary, danger)
- [ ] Verify form inputs are styled correctly
- [ ] Check severity badges have correct colors:
  - Critical: Red
  - High: Orange
  - Medium: Yellow
  - Low: Green
  - Info: Blue

#### 7.2 Responsiveness
- [ ] Resize window smaller
- [ ] Verify layouts adapt (if implemented)
- [ ] Check sidebar doesn't overflow
- [ ] Verify content areas scroll properly

#### 7.3 Interactions
- [ ] Hover over buttons → should show hover state
- [ ] Click interactions feel responsive
- [ ] No double-click required
- [ ] Forms submit without errors

---

## 🐛 Bug Tracking

### Issues Found

| # | Feature | Issue | Severity | Status |
|---|---------|-------|----------|--------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

**Template:**
```
# Issue ID
Feature: [Writeups/Workflows/Notes/Other]
Issue: [Description]
Severity: [Critical/High/Medium/Low]
Steps to Reproduce:
1. 
2. 
3. 
Expected: [What should happen]
Actual: [What actually happens]
Status: [Open/In Progress/Fixed]
```

---

## ✅ Test Results Summary

**Testing Date:** _____________  
**Tester:** _____________

### Feature Completeness

- [ ] Writeups: Fully working
- [ ] Workflows: Fully working
- [ ] Notes: Fully working
- [ ] Data Persistence: Working
- [ ] Export Functions: Working

### Critical Issues
- None / List here:

### Non-Critical Issues
- None / List here:

### Overall Assessment
- [ ] Ready for use
- [ ] Needs minor fixes
- [ ] Needs major fixes

---

## 🎯 Success Criteria

The application is considered fully functional when:

1. ✅ All tabs switch correctly
2. ✅ Can create/edit/delete writeups
3. ✅ Can create/edit/delete workflows
4. ✅ Can create/edit/delete notes
5. ✅ Data persists in project save/load
6. ✅ Export functions work for all content types
7. ✅ Search works in notes
8. ✅ No console errors during normal use
9. ✅ UI is visually correct and usable
10. ✅ No data loss during session

---

## 📝 Notes

Use this section to document any additional observations, suggestions for improvements, or edge cases discovered during testing.

---

**Happy Testing! 🐛**
