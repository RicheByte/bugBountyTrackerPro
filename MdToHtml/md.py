"""
Markdown to HTML Converter with Metadata Support

Features:
- Converts .md files to styled HTML pages
- Extracts YAML metadata headers
- Generates article index/archive
- Automatic CSS management
"""

import markdown
import os
import re
from datetime import datetime
import shutil

# Constants
CSS_FILE = 'minimal.css'
DEFAULT_TITLE = 'Untitled Article'
INDEX_FILE = 'articles.html'

def extract_metadata(match, metadata):
    """
    Extract YAML metadata from markdown header
    
    Args:
        match (re.Match): Regex match object containing metadata block
        metadata (dict): Dictionary to populate with metadata values
    
    Returns:
        str: Always returns empty string (replaces metadata block in content)
    """
    for line in match.group(1).split('\n'):
        if ':' in line:
            key, value = map(str.strip, line.split(':', 1))
            metadata[key.lower()] = value
    return ''

def read_file_content(file_path):
    """
    Safely read contents of a file with validation
    
    Args:
        file_path (str): Path to file to read
    
    Returns:
        str: File contents
    
    Raises:
        FileNotFoundError: If file doesn't exist
    """
    if not os.path.isfile(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    with open(file_path, 'r', encoding='utf-8') as f:
        return f.read()

def create_html_template(metadata, html_content, css_file):
    """
    Generate complete HTML document from components
    
    Args:
        metadata (dict): Article metadata (title, date)
        html_content (str): Converted HTML content from markdown
        css_file (str): Name of CSS file to link
    
    Returns:
        str: Complete HTML document as string
    """
    current_year = datetime.now().year
    title = metadata.get('title', DEFAULT_TITLE)
    date = metadata.get('date', datetime.now().strftime('%Y-%m-%d'))

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="{css_file}">
</head>
<body>
    <nav class="main-nav">
        <a href="index.html">Home</a>
        <a href="{INDEX_FILE}">Archive</a>
    </nav>

    <article class="content">
        <header>
            <h1>{title}</h1>
            <div class="meta">
                <time>{date}</time>
            </div>
        </header>
        {html_content}
    </article>

    <footer>
        <p>&copy; {current_year} Minimal Publishing</p>
    </footer>
</body>
</html>"""

def process_metadata(md_content):
    """
    Extract and remove YAML metadata from markdown content
    
    Args:
        md_content (str): Original markdown content
    
    Returns:
        tuple: (cleaned_md_content, metadata_dict)
    """
    metadata = {}
    cleaned_content = re.sub(
        r'^---\s*\n(.*?)\n---\s*\n',
        lambda m: extract_metadata(m, metadata),
        md_content,
        count=1,
        flags=re.DOTALL
    )
    return cleaned_content, metadata

def ensure_css_exists(output_dir, css_source):
    """
    Copy CSS file to output directory if not present
    
    Args:
        output_dir (str): Target directory for CSS file
        css_source (str): Path to source CSS file
    """
    css_filename = os.path.basename(css_source)
    dest_path = os.path.join(output_dir, css_filename)
    
    if not os.path.exists(dest_path):
        shutil.copyfile(css_source, dest_path)

def convert_md_to_html(md_file_path, css_path=CSS_FILE):
    """
    Convert markdown file to styled HTML document
    
    Args:
        md_file_path (str): Path to input markdown file
        css_path (str): Path to CSS stylesheet
    
    Returns:
        str: Path to generated HTML file
    """
    # Read and process content
    md_content = read_file_content(md_file_path)
    cleaned_md, metadata = process_metadata(md_content)
    html_content = markdown.markdown(cleaned_md, extensions=['fenced_code', 'tables'])
    
    # Set up output paths
    output_dir = os.path.dirname(md_file_path)
    base_name = os.path.splitext(os.path.basename(md_file_path))[0]
    html_filename = f"{base_name}.html"
    
    # Ensure CSS is available
    ensure_css_exists(output_dir, css_path)
    
    # Generate and save HTML
    full_html = create_html_template(metadata, html_content, os.path.basename(css_path))
    output_path = os.path.join(output_dir, html_filename)
    
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(full_html)
    
    print(f"Successfully converted: {output_path}")
    return output_path

def generate_article_index(content_dir='.'):
    """
    Create index page listing all articles
    
    Args:
        content_dir (str): Directory containing markdown files
    """
    articles = []
    
    for filename in os.listdir(content_dir):
        if filename.endswith('.md'):
            md_path = os.path.join(content_dir, filename)
            content = read_file_content(md_path)
            _, metadata = process_metadata(content)
            
            articles.append({
                'filename': os.path.splitext(filename)[0] + '.html',
                'metadata': metadata
            })
    
    # Sort articles by date (newest first)
    articles.sort(key=lambda x: x['metadata'].get('date', ''), reverse=True)
    
    # Generate index content
    article_list = []
    for article in articles:
        title = article['metadata'].get('title', 'Untitled')
        date = article['metadata'].get('date', '')
        article_list.append(f"""
        <section class="article-preview">
            <h2><a href="{article['filename']}">{title}</a></h2>
            <time>{date}</time>
        </section>
        """)
    
    index_content = f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Article Archive</title>
    <link rel="stylesheet" href="{CSS_FILE}">
</head>
<body>
    <nav class="main-nav">
        <a href="index.html">Home</a>
        <a href="{INDEX_FILE}">Archive</a>
    </nav>

    <main class="archive">
        {"".join(article_list)}
    </main>

    <footer>
        <p>&copy; {datetime.now().year} Minimal Publishing</p>
    </footer>
</body>
</html>"""
    
    index_path = os.path.join(content_dir, INDEX_FILE)
    with open(index_path, 'w', encoding='utf-8') as f:
        f.write(index_content)
    
    print(f"Created article index: {index_path}")

def create_default_stylesheet():
    """Create default CSS file if it doesn't exist"""
    if not os.path.exists(CSS_FILE):
        css_content = """/* Modern Minimal CSS Theme */
/* ... (keep your existing CSS content here) ... */
"""
        with open(CSS_FILE, 'w', encoding='utf-8') as f:
            f.write(css_content)
        print(f"Created default stylesheet: {CSS_FILE}")

if __name__ == "__main__":
    # Example usage
    create_default_stylesheet()
    
    # Convert sample article
    sample_md = '/home/riche/MdToHtml/newtest.md'  # Update this path
    convert_md_to_html(sample_md)
    
    # Generate index
    generate_article_index()
