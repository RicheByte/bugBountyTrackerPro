

## **1. Monitoring System Performance**

Before optimizing, it's important to analyze system performance.

### **1.1 CPU Usage**

- Check CPU load:
    
    ```bash
    top
    ```
    
    or
    
    ```bash
    htop  # (More user-friendly, requires installation)
    ```
    
- Get detailed CPU stats:
    
    ```bash
    mpstat -P ALL 1  # Install sysstat package if missing
    ```
    

### **1.2 Memory Usage**

- View memory status:
    
    ```bash
    free -m
    ```
    
- Check memory-intensive processes:
    
    ```bash
    ps aux --sort=-%mem | head -10
    ```
    

### **1.3 Disk Usage**

- Check disk space usage:
    
    ```bash
    df -h
    ```
    
- Find large files:
    
    ```bash
    du -ah / | sort -rh | head -10
    ```
    

### **1.4 I/O Performance**

- Monitor disk I/O usage:
    
    ```bash
    iostat -xz 1
    ```
    
- Check disk latency:
    
    ```bash
    ioping -c 10 /
    ```
    

### **1.5 Network Performance**

- Check network usage:
    
    ```bash
    iftop  # Requires installation
    ```
    
- Measure network speed:
    
    ```bash
    speedtest-cli
    ```
    

---

## **2. Optimizing CPU Performance**

### **2.1 Adjust CPU Governor**

- Check current governor:
    
    ```bash
    cat /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
    ```
    
- Set performance mode:
    
    ```bash
    echo "performance" | sudo tee /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor
    ```
    

### **2.2 Reduce CPU Load**

- Find high CPU processes:
    
    ```bash
    ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head
    ```
    
- Limit CPU usage of a process:
    
    ```bash
    cpulimit -p <PID> -l 30  # Limits to 30% CPU
    ```
    

---

## **3. Optimizing RAM Usage**

### **3.1 Reduce Swappiness**

- Check current swappiness:
    
    ```bash
    cat /proc/sys/vm/swappiness
    ```
    
- Reduce swappiness (set to 10):
    
    ```bash
    sudo sysctl vm.swappiness=10
    ```
    

### **3.2 Clear Cached Memory**

- Free up memory without killing processes:
    
    ```bash
    sudo sync; echo 3 | sudo tee /proc/sys/vm/drop_caches
    ```
    

---

## **4. Optimizing Disk Performance**

### **4.1 Enable TRIM for SSDs**

- Check if TRIM is supported:
    
    ```bash
    sudo fstrim -v /
    ```
    
- Enable periodic TRIM:
    
    ```bash
    sudo systemctl enable fstrim.timer
    ```
    

### **4.2 Optimize File System**

- Use noatime to reduce disk writes:
    
    ```bash
    sudo nano /etc/fstab
    ```
    
    Add `noatime` option to relevant partitions:
    
    ```
    UUID=xxxx / ext4 defaults,noatime 0 1
    ```
    
- Enable write caching:
    
    ```bash
    sudo hdparm -W1 /dev/sda
    ```
    

---

## **5. Optimizing Network Performance**

### **5.1 Increase TCP Buffers**

- Check current settings:
    
    ```bash
    sysctl net.core.rmem_max
    ```
    
- Increase buffer size:
    
    ```bash
    sudo sysctl -w net.core.rmem_max=16777216
    sudo sysctl -w net.core.wmem_max=16777216
    ```
    

### **5.2 Reduce DNS Lookup Time**

- Use a faster DNS like Google:
    
    ```bash
    sudo nano /etc/resolv.conf
    ```
    
    Add:
    
    ```
    nameserver 8.8.8.8
    nameserver 8.8.4.4
    ```
    

---

## **6. Optimizing Startup & Background Services**

### **6.1 Disable Unnecessary Services**

- List enabled services:
    
    ```bash
    systemctl list-unit-files --type=service | grep enabled
    ```
    
- Disable a service:
    
    ```bash
    sudo systemctl disable <service_name>
    ```
    

### **6.2 Reduce Boot Time**

- Check boot time:
    
    ```bash
    systemd-analyze
    ```
    
- Identify slow services:
    
    ```bash
    systemd-analyze blame
    ```
    

---

## **7. Kernel & Scheduler Optimization**

### **7.1 Tune Kernel Parameters**

- Adjust kernel parameters dynamically:
    
    ```bash
    sudo sysctl -w vm.dirty_ratio=10
    ```
    

### **7.2 Change Process Scheduler**

- Check current scheduler:
    
    ```bash
    cat /sys/block/sda/queue/scheduler
    ```
    
- Set to `mq-deadline` for SSD:
    
    ```bash
    echo "mq-deadline" | sudo tee /sys/block/sda/queue/scheduler
    ```
    

---

## **8. Power Management & Performance Balancing**

### **8.1 Disable Unused Devices**

- Disable Bluetooth if not needed:
    
    ```bash
    sudo systemctl disable bluetooth
    ```
    
- Disable webcam:
    
    ```bash
    echo "blacklist uvcvideo" | sudo tee -a /etc/modprobe.d/blacklist.conf
    ```
    

---

## **9. Security & Performance Hardening**

### **9.1 Reduce Logging**

- Disable excessive logging:
    
    ```bash
    sudo systemctl stop systemd-journald
    sudo systemctl disable systemd-journald
    ```
    

### **9.2 Optimize Firewall Rules**

- View active rules:
    
    ```bash
    sudo iptables -L -v
    ```
    
- Limit SYN flood attacks:
    
    ```bash
    sudo iptables -A INPUT -p tcp --syn -m limit --limit 1/s --limit-burst 3 -j ACCEPT
    ```
    

---

## **10. Automate Optimization**

### **10.1 Create a Script**

- Automate tasks:
    
    ```bash
    nano optimize.sh
    ```
    
    Add:
    
    ```bash
    #!/bin/bash
    echo "Optimizing system..."
    sudo sysctl -w vm.swappiness=10
    sudo sysctl -w net.core.rmem_max=16777216
    sudo systemctl disable bluetooth
    echo "Optimization complete!"
    ```
    
- Make executable:
    
    ```bash
    chmod +x optimize.sh
    ```
    
- Run:
    
    ```bash
    ./optimize.sh
    ```
    

## **Linux Performance Optimization Using CLI (Zero to Hero)**

### **1. System Monitoring**

Before optimizing, you need to monitor system performance.

#### **1.1 CPU Usage**

- **Check CPU load**
    
    ```bash
    top
    htop   # (if installed, provides a better UI)
    ```
    
- **View CPU details**
    
    ```bash
    lscpu
    cat /proc/cpuinfo
    ```
    
- **Check CPU-intensive processes**
    
    ```bash
    ps -eo pid,ppid,cmd,%mem,%cpu --sort=-%cpu | head
    ```
    

#### **1.2 Memory Usage**

- **View memory usage**
    
    ```bash
    free -h
    cat /proc/meminfo
    ```
    
- **List processes consuming most memory**
    
    ```bash
    ps aux --sort=-%mem | head
    ```
    

#### **1.3 Disk Usage & I/O**

- **Check disk space usage**
    
    ```bash
    df -h
    ```
    
- **Find large files**
    
    ```bash
    du -ah / | sort -rh | head -10
    ```
    
- **Check disk I/O performance**
    
    ```bash
    iostat -dx 1
    ```
    

#### **1.4 Network Performance**

- **Check network usage**
    
    ```bash
    iftop   # (requires installation)
    ```
    
- **Test network speed**
    
    ```bash
    speedtest-cli
    ```
    

---

### **2. Optimizing CPU Performance**

- **Change CPU governor to performance mode**
    
    ```bash
    cpufreq-set -g performance
    ```
    
- **Limit CPU usage of a process**
    
    ```bash
    cpulimit -p <PID> -l <CPU%>
    ```
    
- **Kill high CPU-consuming processes**
    
    ```bash
    kill -9 <PID>
    ```
    

---

### **3. Optimizing Memory Usage**

- **Clear memory cache**
    
    ```bash
    sync; echo 3 > /proc/sys/vm/drop_caches
    ```
    
- **Disable unnecessary services**
    
    ```bash
    systemctl disable <service>
    ```
    
- **Optimize swap usage**
    
    ```bash
    sysctl vm.swappiness=10
    ```
    

---

### **4. Disk Optimization**

- **Remove unused files**
    
    ```bash
    apt autoremove
    ```
    
- **Delete old logs**
    
    ```bash
    journalctl --vacuum-time=7d
    ```
    
- **Optimize filesystem**
    
    ```bash
    fsck -y /dev/sdX
    ```
    

---

### **5. Network Optimization**

- **Flush DNS cache**
    
    ```bash
    systemd-resolve --flush-caches
    ```
    
- **Limit bandwidth usage of a process**
    
    ```bash
    wondershaper eth0 1000 500  # (1000kbps down, 500kbps up)
    ```
    

---

### **6. Kernel & Boot Optimization**

- **Reduce GRUB timeout**
    
    ```bash
    sudo nano /etc/default/grub
    # Change GRUB_TIMEOUT=5 to GRUB_TIMEOUT=1
    sudo update-grub
    ```
    
- **Disable unnecessary kernel modules**
    
    ```bash
    lsmod | grep <module>
    sudo modprobe -r <module>
    ```
    

---

### **7. Automate Optimization with Scripts**

- **Example script to clean cache, logs, and optimize RAM**
    
    ```bash
    #!/bin/bash
    echo "Clearing Cache..."
    sync; echo 3 > /proc/sys/vm/drop_caches
    echo "Cleaning logs..."
    journalctl --vacuum-time=7d
    echo "Done!"
    ```
    
    Save as `optimize.sh` and run:
    
    ```bash
    chmod +x optimize.sh
    ./optimize.sh
    ```
    

---

### **8. Advanced Tuning with sysctl**

- **Optimize TCP for faster network**
    
    ```bash
    sudo sysctl -w net.core.rmem_max=16777216
    sudo sysctl -w net.core.wmem_max=16777216
    ```
    

---

### **Final Thoughts**

With these optimizations, your Linux system will run faster and smoother.