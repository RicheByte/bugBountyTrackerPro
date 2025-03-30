// Configure your courses and notes here
const courses = [
    {
        name: "Devops",
        path: "./NOTES/DEVOP",
        notes: ["I - File Handling and Text Processing in Linux CLI.md"]
    },
    {
        name: "Course 2",
        path: "NOTES/course2",
        notes: ["note3.md"]
    },
    {
        name: "Course 3",
        path: "NOTES/course3",
        notes: ["note4.md"]
    }
];

let currentCourse = null;

// Initialize the app
function init() {
    populateCourses();
    setupSearch();
}

function populateCourses() {
    const container = document.getElementById('courses');
    courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'course-item';
        div.textContent = course.name;
        div.onclick = () => loadCourse(course);
        container.appendChild(div);
    });
}

function loadCourse(course) {
    currentCourse = course;
    document.querySelectorAll('.course-item').forEach(item => 
        item.classList.remove('active'));
    document.querySelectorAll('.note-item').forEach(item => 
        item.classList.remove('active'));
    
    const notesContainer = document.getElementById('notes');
    notesContainer.innerHTML = '';
    
    course.notes.forEach(note => {
        const div = document.createElement('div');
        div.id = note;  // Ensure ID includes .md extension for proper reference
        div.className = 'note-item';
        div.textContent = note.replace('.md', '');  // Display without .md
        div.onclick = () => loadNote(note);  // Pass full note name
        notesContainer.appendChild(div);
    });

    // Set first course as active
    document.querySelector('.course-item').classList.add('active');

    // Clear content and search
    document.getElementById('search').value = '';
    document.getElementById('content').innerHTML = '';
}

// Change the loadNote function to:
async function loadNote(noteFile) {
    try {
        const encodedNote = encodeURIComponent(noteFile);
        console.log("Fetching:", `${currentCourse.path}/${encodedNote}`);
        const response = await fetch(`${currentCourse.path}/${encodedNote}`);
        
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const markdown = await response.text();
        document.getElementById('content').innerHTML = marked.parse(markdown);
    } catch (error) {
        document.getElementById('content').innerHTML = `
            <div class="error">
                <h3>Failed to load note</h3>
                <p>${error.message}</p>
                <p>Full path: <code>${window.location.origin}${currentCourse.path}/${encodedNote}</code></p>
            </div>
        `;
    }
}

function setupSearch() {
    document.getElementById('search').addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const notes = document.getElementById('notes').children;
        
        Array.from(notes).forEach(note => {
            const text = note.textContent.toLowerCase();
            note.style.display = text.includes(searchTerm) ? 'block' : 'none';
        });
    });
}

init();
