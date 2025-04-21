

---

## PART 1: BASICS — GETTING A FEEL OF THE SYSTEM

### 🔍 1. System Resource Usage

```bash
top              # Real-time view of CPU/memory usage
htop             # Enhanced version of top (install with: sudo apt install htop)
vmstat 1         # CPU, memory, IO stats every 1s
free -h          # Memory usage (human readable)
uptime           # System load and uptime
```

###  2. CPU Info

```bash
lscpu            # Info about CPU architecture
cat /proc/cpuinfo
```

### 3. Memory Info

```bash
cat /proc/meminfo
```

---

##  PART 2: DISK, I/O, AND NETWORK

###  Disk Usage & I/O

```bash
df -h                   # Disk space usage
du -sh *                # Size of each file/dir in current dir
iotop                   # Real-time disk I/O (sudo apt install iotop)
iostat -xz 1            # CPU & disk I/O stats (sudo apt install sysstat)
```

###  Network Monitoring

```bash
ip a                    # Show IP addresses
ss -tulnp               # Show open ports & listening services
nload                   # Live network traffic monitor (sudo apt install nload)
iftop                   # Interface traffic (sudo apt install iftop)
```

---

## PART 3: DEEP PROCESS INSPECTION

### Process Management

```bash
ps aux                  # View all processes
top or htop             # Interactively monitor
nice -n 10 command      # Set process priority (lower = higher priority)
renice -n 5 -p <pid>    # Change priority of running process
kill -9 <pid>           # Force kill process
```

---

##  PART 4: `strace` — SYSTEM CALL TRACER (Advanced)

###  What it does:

Traces system calls & signals made by a program. Super useful for debugging, finding bottlenecks, or analyzing errors.

```bash
strace -p <pid>         # Trace a running process
strace ./my_script      # Run + trace a program
strace -o trace.log ./my_script  # Save trace to a file
strace -T -tt ./my_script        # Include time and duration of each call
```

### Common Use Cases:

- Debugging why a script is slow (maybe waiting on I/O?)
    
- Catching permission errors
    
- Seeing file access or syscall usage
    

---

## PART 5: `lsof` — LIST OPEN FILES (and sockets)

```bash
lsof                   # List all open files (HUGE list!)
lsof -p <pid>          # Files opened by a process
lsof -i                # Show network connections
lsof /path/to/file     # See which process is using a file
```

###  Why it rocks:

- See what’s locking your file
    
- See which ports a program is listening on
    
- Detect open files that are deleted but still used
    

---

##  PART 6: PERFORMANCE DIAGNOSTIC TOOLS

###  Real-Time CLI Tools

```bash
dstat                  # Versatile resource usage (cpu, disk, net) (install with: sudo apt install dstat)
sar                    # Historical performance logs (enable via sysstat)
perf stat ./command    # Performance counter stats
pidstat 1              # Per-process resource usage
```

###  Analyze with:

```bash
time ./script.sh       # Execution time breakdown
/usr/bin/time -v ./script.sh   # Detailed resource usage
```

---

##  PART 7: PERFORMANCE OPTIMIZATION TRICKS

### System-Wide Optimizations

- Disable unused services: `systemctl disable servicename`
    
- Clean up memory cache:
    
    ```bash
    sync; echo 3 > /proc/sys/vm/drop_caches  # ⚠️ Temporary! Use with caution.
    ```
    

###  Boosting App Performance

- Use `nice`, `ionice`, or `taskset` to control CPU and IO priority.
    
- Consider using `cpulimit` to prevent a process from using too much CPU.
    

---

##  PART 8: MONITORING IN ONE COMMAND

```bash
watch -n 1 'ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head'  
```

See top CPU-consuming processes every second.

---

##  Suggested Toolkit Summary

|Tool|Use|
|---|---|
|`top/htop`|Real-time resource usage|
|`vmstat`|System health snapshot|
|`iotop`|Disk I/O usage|
|`iftop`|Network traffic|
|`strace`|Syscall tracing|
|`lsof`|List open files/sockets|
|`perf`|CPU performance counters|
|`pidstat`|Per-process resource monitoring|
|`nice`|Priority control|
|`time`|Track script execution stats|

---
