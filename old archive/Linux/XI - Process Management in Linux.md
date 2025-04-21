
This guide covers everything about **process management** in Linux, from listing and monitoring processes to killing and managing them efficiently.

---

## **1. Understanding Linux Processes**

A **process** is any running instance of a program in Linux. Each process has:

- **PID (Process ID):** A unique identifier for the process
    
- **PPID (Parent Process ID):** The process that started it
    
- **UID (User ID):** The owner of the process
    
- **Status:** Running, sleeping, stopped, etc.
    

---

## **2. Listing and Monitoring Processes**

### **View Running Processes**

- **List all running processes:**
    
    ```bash
    ps aux
    ```
    
- **List processes with a tree structure (shows parent-child relationship):**
    
    ```bash
    ps -axjf
    ```
    
- **List processes with full details:**
    
    ```bash
    ps -ef
    ```
    
- **Filter processes by a specific user:**
    
    ```bash
    ps -u username
    ```
    

### **Monitor System Processes in Real Time**

- **Live process view (like Task Manager):**
    
    ```bash
    top
    ```
    
- **Improved interactive process viewer (`htop`, install if not available):**
    
    ```bash
    htop
    ```
    
    (Use `sudo apt install htop` or `sudo yum install htop` to install.)
    
- **Show processes sorted by memory usage:**
    
    ```bash
    ps aux --sort=-%mem | head -10
    ```
    
- **Show processes sorted by CPU usage:**
    
    ```bash
    ps aux --sort=-%cpu | head -10
    ```
    

---

## **3. Finding Specific Processes**

### **Find a Process by Name**

```bash
pgrep process_name
```

Example:

```bash
pgrep firefox
```

### **Find a Process by Keyword**

```bash
ps aux | grep process_name
```

Example:

```bash
ps aux | grep apache
```

---

## **4. Killing or Stopping Processes**

### **Kill a Process by PID**

- **Find the PID:**
    
    ```bash
    ps aux | grep process_name
    ```
    
- **Kill the process:**
    
    ```bash
    kill PID
    ```
    

Example:

```bash
kill 1234
```

### **Force Kill (if the process does not stop)**

```bash
kill -9 PID
```

Example:

```bash
kill -9 1234
```

### **Kill a Process by Name**

```bash
pkill process_name
```

Example:

```bash
pkill firefox
```

### **Kill All Processes by Name**

```bash
killall process_name
```

Example:

```bash
killall firefox
```

---

## **5. Suspending and Resuming Processes**

### **Pause (Suspend) a Process**

- Find the PID and run:
    
    ```bash
    kill -STOP PID
    ```
    

Example:

```bash
kill -STOP 1234
```

### **Resume a Process**

```bash
kill -CONT PID
```

Example:

```bash
kill -CONT 1234
```

---

## **6. Running Processes in the Background**

### **Run a Command in the Background**

```bash
command &
```

Example:

```bash
firefox &
```

### **List Background Jobs**

```bash
jobs
```

### **Bring a Background Job to the Foreground**

```bash
fg %job_number
```

Example:

```bash
fg %1
```

### **Send a Running Process to the Background**

- Pause it: `CTRL + Z`
    
- Move it to the background:
    
    ```bash
    bg
    ```
    

---

## **7. Process Priorities (Nice & Renice)**

Each process has a priority level:

- **Nice value range:** `-20` (highest priority) to `19` (lowest priority)
    

### **Start a Process with a Custom Priority**

```bash
nice -n priority command
```

Example:

```bash
nice -n 10 firefox
```

### **Change the Priority of a Running Process**

```bash
renice priority -p PID
```

Example:

```bash
renice -5 -p 1234
```

### **View Process Priorities**

```bash
ps -eo pid,ni,comm | grep process_name
```

---

## **8. Monitoring System Resource Usage**

### **Check CPU Usage**

```bash
top
```

or

```bash
htop
```

### **Check Memory Usage**

```bash
free -h
```

### **Check Disk Usage by Processes**

```bash
iotop
```

(Install using `sudo apt install iotop` if not available.)

### **Check Network Usage by Processes**

```bash
nethogs
```

(Install using `sudo apt install nethogs` if not available.)

---

## **9. Advanced Process Management**

### **Run a Process That Persists After Logout**

```bash
nohup command &
```

Example:

```bash
nohup firefox &
```

### **Run a Process in the Background with `screen`**

- Start a new session:
    
    ```bash
    screen -S session_name
    ```
    
- Run a command, then press **CTRL + A, then D** to detach.
    
- List all sessions:
    
    ```bash
    screen -ls
    ```
    
- Reattach to a session:
    
    ```bash
    screen -r session_name
    ```
    

### **Run a Process in the Background with `tmux`**

- Start a new session:
    
    ```bash
    tmux new -s session_name
    ```
    
- Detach: **CTRL + B, then D**
    
- List sessions:
    
    ```bash
    tmux ls
    ```
    
- Reattach:
    
    ```bash
    tmux attach -t session_name
    ```
    

---

## **10. Logging and Debugging Processes**

### **Check Process Logs**

- View system logs:
    
    ```bash
    sudo journalctl -u process_name
    ```
    
- Check recent logs:
    
    ```bash
    sudo journalctl -r -n 50
    ```
    

### **Trace System Calls of a Process**

```bash
strace -p PID
```

### **Monitor a Process in Real Time**

```bash
watch -n 1 ps aux | grep process_name
```

---

This guide covers **everything** about process management in Linux! 