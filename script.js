// Configure your courses and notes here
const courses = [
    {
        name: "Devops",
        path: "/NOTES/DEVOPS",
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

async function loadNote(noteFile) {
    try {
        // Log to see the path and note being loaded
        console.log(`Loading note from path: ${currentCourse.path}/${noteFile}`);

        const response = await fetch(`${currentCourse.path}/${noteFile}`);

        // Check if the response is OK
        if (!response.ok) {
            throw new Error(`Failed to load note: ${response.statusText}`);
        }

        // Get markdown content from the note
        const markdown = await response.text();

        // Remove active class from all notes
        document.querySelectorAll('.note-item').forEach(item => item.classList.remove('active'));

        // Add active class to the selected note
        document.getElementById(noteFile).classList.add('active');

        // Convert markdown to HTML and insert it into the content div
        document.getElementById('content').innerHTML = marked.parse(markdown);
    } catch (error) {
        // Log and show an error message if something goes wrong
        console.error(error);
        document.getElementById('content').innerHTML = `<p>Error loading note: ${error.message}</p>`;
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
