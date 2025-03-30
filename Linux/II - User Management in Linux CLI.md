
### **1. Creating and Managing Users**

- Add a new user:
    
    ```bash
    sudo adduser username
    ```
    
- Set or change a user’s password:
    
    ```bash
    sudo passwd username
    ```
    
- Delete a user (without removing their home directory):
    
    ```bash
    sudo deluser username
    ```
    
- Delete a user and remove their home directory:
    
    ```bash
    sudo deluser --remove-home username
    ```
    
- Delete a user and all their files:
    
    ```bash
    sudo deluser --remove-all-files username
    ```
    
- Display information about a user:
    
    ```bash
    id username
    ```
    
- Show details of the currently logged-in user:
    
    ```bash
    whoami
    ```
    

### **2. User Groups and Permissions**

- Create a new group:
    
    ```bash
    sudo groupadd groupname
    ```
    
- Add a user to a group:
    
    ```bash
    sudo usermod -aG groupname username
    ```
    
- Remove a user from a group:
    
    ```bash
    sudo deluser username groupname
    ```
    
- Change a user’s primary group:
    
    ```bash
    sudo usermod -g newgroup username
    ```
    
- List all groups:
    
    ```bash
    cat /etc/group
    ```
    
- Show groups a user belongs to:
    
    ```bash
    groups username
    ```
    

### **3. Managing User Permissions**

- Change file ownership:
    
    ```bash
    sudo chown username:groupname filename
    ```
    
- Give read, write, and execute permissions:
    
    ```bash
    chmod 755 filename
    ```
    
- Assign full permissions to a user:
    
    ```bash
    sudo chmod u+rwx filename
    ```
    
- Set default permissions for new files (umask):
    
    ```bash
    umask 022
    ```
    

### **4. Switching and Managing User Sessions**

- Switch to another user:
    
    ```bash
    su - username
    ```
    
- Execute a command as another user:
    
    ```bash
    sudo -u username command
    ```
    
- View all logged-in users:
    
    ```bash
    who
    ```
    
- Show last login details:
    
    ```bash
    last username
    ```
    

### **5. Managing User Sessions and Accounts**

- Lock a user account:
    
    ```bash
    sudo usermod -L username
    ```
    
- Unlock a user account:
    
    ```bash
    sudo usermod -U username
    ```
    
- Expire a user’s password (force password change on next login):
    
    ```bash
    sudo passwd --expire username
    ```
    
- Disable a user account:
    
    ```bash
    sudo usermod --expiredate 1 username
    ```
    
- View all user accounts on the system:
    
    ```bash
    cat /etc/passwd
    ```
    

### **6. Monitoring User Activity**

- View active user sessions:
    
    ```bash
    w
    ```
    
- See currently logged-in users:
    
    ```bash
    who
    ```
    
- View system login history:
    
    ```bash
    last
    ```
    
- Check user activity and processes:
    
    ```bash
    ps -u username
    ```
    
