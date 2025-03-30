
### **1. Creating Files and Directories**

- Create an empty file:
    
    ```bash
    touch filename.txt
    ```
    
- Create multiple files at once:
    
    ```bash
    touch file1.txt file2.txt file3.txt
    ```
    
- Create a new directory:
    
    ```bash
    mkdir new_directory
    ```
    
- Create nested directories:
    
    ```bash
    mkdir -p parent/child/grandchild
    ```
    

### **2. Listing Files and Directories**

- List all files and directories:
    
    ```bash
    ls
    ```
    
- List with detailed information (permissions, owner, size, date):
    
    ```bash
    ls -l
    ```
    
- List hidden files:
    
    ```bash
    ls -a
    ```
    
- List directories only:
    
    ```bash
    ls -d */
    ```
    
- List files sorted by size (largest first):
    
    ```bash
    ls -lS
    ```
    
- List files sorted by modification time (newest first):
    
    ```bash
    ls -lt
    ```
    

### **3. Navigating Directories**

- Change to a directory:
    
    ```bash
    cd directory_name
    ```
    
- Go up one level:
    
    ```bash
    cd ..
    ```
    
- Go to home directory:
    
    ```bash
    cd ~
    ```
    
- Go to the previous directory:
    
    ```bash
    cd -
    ```
    

### **4. Moving and Renaming Files and Directories**

- Rename a file:
    
    ```bash
    mv oldname.txt newname.txt
    ```
    
- Move a file to another directory:
    
    ```bash
    mv file.txt /path/to/destination/
    ```
    
- Move multiple files:
    
    ```bash
    mv file1.txt file2.txt /path/to/destination/
    ```
    
- Move and rename a directory:
    
    ```bash
    mv old_directory new_directory
    ```
    

### **5. Copying Files and Directories**

- Copy a file:
    
    ```bash
    cp file.txt copy_file.txt
    ```
    
- Copy multiple files:
    
    ```bash
    cp file1.txt file2.txt /destination/
    ```
    
- Copy an entire directory:
    
    ```bash
    cp -r directory_name /destination/
    ```
    

### **6. Deleting Files and Directories**

- Delete a file:
    
    ```bash
    rm filename.txt
    ```
    
- Delete multiple files:
    
    ```bash
    rm file1.txt file2.txt file3.txt
    ```
    
- Delete a directory and its contents:
    
    ```bash
    rm -rf directory_name
    ```
    
- Delete only empty directories:
    
    ```bash
    rmdir empty_directory
    ```
    

### **7. Finding Files and Directories**

- Find a file by name:
    
    ```bash
    find /path/to/search -name "filename.txt"
    ```
    
- Find a directory by name:
    
    ```bash
    find / -type d -name "directory_name"
    ```
    
- Find files larger than 100MB:
    
    ```bash
    find /path/to/search -type f -size +100M
    ```
    
- Find files modified in the last 7 days:
    
    ```bash
    find /path/to/search -type f -mtime -7
    ```
    
- Search for a specific text inside files:
    
    ```bash
    grep -r "search_term" /path/to/directory
    ```
    

### **8. File Permissions and Ownership**

- View file permissions:
    
    ```bash
    ls -l filename.txt
    ```
    
- Change file permissions (e.g., make a file executable):
    
    ```bash
    chmod +x script.sh
    ```
    
- Change ownership of a file:
    
    ```bash
    chown user:group filename.txt
    ```
    

### **9. Archiving and Compression**

- Create a tar archive:
    
    ```bash
    tar -cvf archive.tar directory/
    ```
    
- Extract a tar archive:
    
    ```bash
    tar -xvf archive.tar
    ```
    
- Create a gzip-compressed archive:
    
    ```bash
    tar -czvf archive.tar.gz directory/
    ```
    
- Extract a gzip-compressed archive:
    
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
    
