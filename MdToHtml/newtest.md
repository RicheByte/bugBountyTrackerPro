

### 📌 What is `ulimit`?

`ulimit` is a shell command used to **control the resource limits** for processes run by a user. It is a safeguard that **prevents any single user or process from consuming too many system resources** and potentially crashing the entire system.

---

### 🚨 Why is it important?

Without limits:

- A bug or malicious script could open thousands of files
    
- A user could fork unlimited processes (fork bomb ☢️)
    
- Memory-hungry apps could bring the system to a crawl or crash
    

So `ulimit` sets boundaries to protect the system. Think of it as giving everyone a sandbox 🪁, not the whole beach.

---

## ⚙️ Basic Syntax

```bash
ulimit [-aHS] [limit]
```

- `-a` → Show all limits
    
- `-H` → Show/set hard limit (max enforceable)
    
- `-S` → Show/set soft limit (can be changed by user)
    

---

## 🔍 Common `ulimit` Types

|Limit|Flag|What It Controls|
|---|---|---|
|`open files`|`-n`|Max files a process can open|
|`max user processes`|`-u`|Max number of processes per user|
|`stack size`|`-s`|Max stack size per process|
|`file size`|`-f`|Max file size that can be created (in KB)|
|`core file size`|`-c`|Size of core dumps|
|`max memory size`|`-m`|(Deprecated, use `cgroups` for this)|

---

## 🔧 Examples

### 🔎 View All Limits:

```bash
ulimit -a
```

### 📁 Limit Open Files:

```bash
ulimit -n 1024    # Allow only 1024 open files
```

### 🤖 Limit Number of Processes:

```bash
ulimit -u 100     # User can only start 100 processes
```

### ⚠️ Hard vs Soft Limits

- **Soft limit**: What is currently allowed. Can be increased up to hard limit.
    
- **Hard limit**: The ceiling. Only root can raise it.
    

```bash
ulimit -Sn 2048    # Set soft limit
ulimit -Hn         # Show hard limit
```

---

## 🛠️ Setting Permanent Limits (per user)

Edit `/etc/security/limits.conf` or create a file under `/etc/security/limits.d/`

```
kanchuka   soft   nofile   4096
kanchuka   hard   nofile   8192
kanchuka   soft   nproc    1000
kanchuka   hard   nproc    2000
```

Also ensure `/etc/pam.d/common-session` has this line:

```
session required pam_limits.so
```

---

## 🔄 For System Services (e.g., Nginx, PostgreSQL)

If you're running services with `systemd`, set limits in the service file:

```ini
[Service]
LimitNOFILE=65535
LimitNPROC=4096
```

Then reload systemd:

```bash
sudo systemctl daemon-reexec
sudo systemctl restart your-service
```

---

## 💥 Preventing Fork Bombs

Set a reasonable max process limit per user:

```bash
ulimit -u 1000
```

Or for global safety:

```bash
echo '* hard nproc 2000' >> /etc/security/limits.conf
```

---

## 🧪 Bonus Debug Tip: Check Limits of Running Processes

```bash
cat /proc/<PID>/limits
```

Example:

```bash
cat /proc/1234/limits
```

---

## ✅ Summary

|Task|Command|
|---|---|
|Show all limits|`ulimit -a`|
|Limit open files to 1024|`ulimit -n 1024`|
|Limit user processes to 500|`ulimit -u 500`|
|Set permanent limit|`/etc/security/limits.conf`|
|View process limits|`cat /proc/<pid>/limits`|

---
