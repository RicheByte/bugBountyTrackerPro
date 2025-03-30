
#### **1. Listing Files and Directories**

- List all files in long format (includes permissions, owner, size, and modification time):
    
    ```bash
    ls -la
    ```
    
- Show hidden files only:
    
    ```bash
    ls -d .*
    ```
    
- Sort files by modification time (newest first):
    
    ```bash
    ls -lt
    ```
    
- Sort files by size (largest first):
    
    ```bash
    ls -lS
    ```
    

#### **2. File and Directory Operations**

- Create a new file:
    
    ```bash
    touch filename.txt
    ```
    
- Create a directory:
    
    ```bash
    mkdir new_directory
    ```
    
- Remove a file:
    
    ```bash
    rm filename.txt
    ```
    
- Remove a directory and its contents:
    
    ```bash
    rm -rf directory_name
    ```
    
- Copy a file:
    
    ```bash
    cp source.txt destination.txt
    ```
    
- Move (rename) a file:
    
    ```bash
    mv oldname.txt newname.txt
    ```
    
- Find a file by name:
    
    ```bash
    find /path/to/search -name "filename.txt"
    ```
    
- Find files larger than 100MB:
    
    ```bash
    find /path/to/search -type f -size +100M
    ```
    
- Count the number of files in a directory:
    
    ```bash
    ls -1 | wc -l
    ```
    

#### **3. File Content Viewing and Processing**

- Display the contents of a file:
    
    ```bash
    cat filename.txt
    ```
    
- View a file page by page:
    
    ```bash
    less filename.txt
    ```
    
- Display the first 10 lines of a file:
    
    ```bash
    head filename.txt
    ```
    
- Display the last 10 lines of a file:
    
    ```bash
    tail filename.txt
    ```
    
- Continuously monitor file updates (useful for logs):
    
    ```bash
    tail -f log.txt
    ```
    
- Search for a word inside a file:
    
    ```bash
    grep "word" filename.txt
    ```
    
- Search recursively in all files within a directory:
    
    ```bash
    grep -r "search_term" /path/to/directory
    ```
    
- Replace text in a file using `sed`:
    
    ```bash
    sed -i 's/oldword/newword/g' filename.txt
    ```
    
- Extract columns from a file using `awk`:
    
    ```bash
    awk '{print $1, $3}' filename.txt
    ```
    
- Sort the contents of a file:
    
    ```bash
    sort filename.txt
    ```
    
- Remove duplicate lines from a file:
    
    ```bash
    sort filename.txt | uniq
    ```
    
- Count the number of lines, words, and characters in a file:
    
    ```bash
    wc filename.txt
    ```
    

#### **4. File Permissions**

- Change file permissions (read, write, execute):
    
    ```bash
    chmod 755 filename.sh
    ```
    
- Change file ownership:
    
    ```bash
    chown user:group filename.txt
    ```
    
- Make a script executable:
    
    ```bash
    chmod +x script.sh
    ```
    

#### **5. Compression and Archiving**

- Create a tar archive:
    
    ```bash
    tar -cvf archive.tar directory/
    ```
    
- Extract a tar archive:
    
    ```bash
    tar -xvf archive.tar
    ```
    
- Create a gzip compressed archive:
    
    ```bash
    tar -czvf archive.tar.gz directory/
    ```
    
- Extract a gzip compressed archive:
    
    ```bash
    tar -xzvf archive.tar.gz
    ```
    
- Create a zip file:
    
    ```bash
    zip -r archive.zip directory/
    ```
    
- Extract a zip file:
    
    ```bash
    unzip archive.zip
    ```
    

/
