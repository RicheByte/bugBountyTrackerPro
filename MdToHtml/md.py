import markdown
import os
import re
from datetime import datetime
import shutil

def extract_metadata(match, metadata):
    """Extract metadata from a YAML-like header."""
    metadata_lines = match.group(1).split('\n')
    for line in metadata_lines:
        if ':' in line:
            key, value = line.split(':', 1)
            metadata[key.strip().lower()] = value.strip()
    return ''

def convert_md_to_html(md_file_path, css_path='minimal.css'):
    # Validate inputs
    if not os.path.isfile(md_file_path):
        raise FileNotFoundError(f"Markdown file {md_file_path} not found!")
    if not os.path.isfile(css_path):
        raise FileNotFoundError(f"CSS file {css_path} not found!")

    # Read and process markdown
    with open(md_file_path, 'r', encoding='utf-8') as md_file:
        md_content = md_file.read()

    metadata = {}
    # Use extract_metadata to parse the YAML header if it exists.
    md_content = re.sub(
        r'^---\s*\n(.*?)\n---\s*\n',
        lambda m: extract_metadata(m, metadata),
        md_content,
        count=1,
        flags=re.DOTALL
    )

    # Convert markdown to HTML
    html_content = markdown.markdown(md_content, extensions=['fenced_code', 'tables'])

    # Set up paths
    base_name = os.path.basename(md_file_path)
    html_file_name = os.path.splitext(base_name)[0] + '.html'
    output_dir = os.path.dirname(md_file_path)
    os.makedirs(output_dir, exist_ok=True)

    # Copy CSS to output directory if not already present
    css_dest = os.path.join(output_dir, os.path.basename(css_path))
    if not os.path.exists(css_dest):
        shutil.copyfile(css_path, css_dest)

    # Generate HTML output with minimal design
    html_output = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{metadata.get('title', 'Untitled Article')}</title>
    <link rel="stylesheet" href="{os.path.basename(css_path)}">
</head>
<body>
    <nav class="main-nav">
        <a href="index.html">Home</a>
        <a href="articles.html">Archive</a>
    </nav>

    <article class="content">
        <header>
            <h1>{metadata.get('title', '')}</h1>
            <div class="meta">
                <time>{metadata.get('date', datetime.now().strftime('%Y-%m-%d'))}</time>
            </div>
        </header>
        {html_content}
    </article>

    <footer>
        <p>&copy; {datetime.now().year} Minimal Publishing</p>
    </footer>
</body>
</html>'''

    output_path = os.path.join(output_dir, html_file_name)
    with open(output_path, 'w', encoding='utf-8') as html_file:
        html_file.write(html_output)

    print(f"Converted: {output_path}")
    return output_path

def generate_article_index(md_directory='.'):
    articles = []

    # Process all markdown files in the directory
    for filename in os.listdir(md_directory):
        if filename.endswith('.md'):
            md_path = os.path.join(md_directory, filename)
            with open(md_path, 'r', encoding='utf-8') as f:
                content = f.read()
                metadata = {}
                match = re.search(r'^---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
                if match:
                    # Use the same helper for metadata extraction
                    extract_metadata(match, metadata)
                articles.append({
                    'filename': os.path.splitext(filename)[0] + '.html',
                    'metadata': metadata
                })

    # Generate the index HTML with a minimal design
    index_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Article Archive</title>
    <link rel="stylesheet" href="minimal.css">
</head>
<body>
    <nav class="main-nav">
        <a href="index.html">Home</a>
        <a href="articles.html">Archive</a>
    </nav>

    <main class="archive">
        {"".join(f'''
        <section class="article-preview">
            <h2><a href="{art['filename']}">{art['metadata'].get('title', 'Untitled')}</a></h2>
            <time>{art['metadata'].get('date', '')}</time>
        </section>
        ''' for art in articles)}
    </main>

    <footer>
        <p>&copy; {datetime.now().year} Minimal Publishing</p>
    </footer>
</body>
</html>'''

    index_path = os.path.join(md_directory, 'articles.html')
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_html)
    print(f"Index created: {index_path}")

# Create minimal.css content
MINIMAL_CSS = '''
/* Modern Dark Theme with Enhanced Letter & Line Spacing */

/* Ultra-minimal reset */
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

html {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.8; /* Increased for better readability */
    font-size: 18px;
    color: #e0e0e0;
    background: #121212;
}

body {
    max-width: 800px;
    margin: 2rem auto;
    padding: 0 1rem;
}

/* Navigation */
.main-nav {
    border-bottom: 1px solid #333;
    padding: 1rem 0;
    margin-bottom: 2rem;
}

.main-nav a {
    text-decoration: none;
    color: #bbb;
    margin-right: 1.5rem;
    letter-spacing: 1.2px;  /* Increased letter spacing */
    transition: color 0.3s ease;
}

.main-nav a:hover {
    color: #fff;
}

/* Content Header */
.content header {
    margin-bottom: 2rem;
}

.content h1 {
    font-size: 2.7rem;
    margin-bottom: 0.7rem;
    font-weight: 500;
    letter-spacing: 1.5px; /* More space between letters */
    line-height: 1.9; /* More vertical space */
}

/* Metadata */
.meta {
    color: #aaa;
    font-size: 1rem;
    line-height: 1.8; /* More spacing */
}

/* Footer */
footer {
    border-top: 1px solid #333;
    margin-top: 3rem;
    padding: 1rem 0;
    color: #aaa;
    font-size: 1rem;
    text-align: center;
    line-height: 2; /* More spacing */
}

/* Archive/Index Page */
.archive .article-preview {
    margin-bottom: 2.5rem;
}

.archive h2 {
    font-size: 1.4rem;
    font-weight: 500;
    margin-bottom: 0.4rem;
    letter-spacing: 1.2px; /* More space for readability */
    line-height: 1.9;
}

.archive h2 a {
    text-decoration: none;
    color: #bbb;
    transition: color 0.3s ease;
}

.archive h2 a:hover {
    color: #fff;
}

.archive time {
    display: block;
    color: #aaa;
    font-size: 1rem;
    line-height: 1.9;
}

/* Paragraphs */
p {
    font-size: 1.1rem;
    line-height: 2.2; /* Generous spacing for easy reading */
    letter-spacing: 1px;
    margin-bottom: 1.5rem;
}

/* Code Blocks */
pre {
    background: #1e1e1e;
    padding: 1.2rem;
    overflow-x: auto;
    font-size: 1rem;
    border-radius: 6px;
    margin: 1.5rem 0;
    line-height: 1.9;
}

code {
    font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
    color: #e0e0e0;
}

'''

# Save minimal.css to the current directory
with open('minimal.css', 'w', encoding='utf-8') as f:
    f.write(MINIMAL_CSS)

if __name__ == "__main__":
    # Example usage: Convert a sample Markdown file and generate an index.
    convert_md_to_html('/home/riche/MdToHtml/newtest.md')
    generate_article_index()
