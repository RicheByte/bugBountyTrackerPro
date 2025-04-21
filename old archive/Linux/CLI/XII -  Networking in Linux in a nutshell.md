

This guide covers everything about **networking in Linux**, from checking connections to advanced network troubleshooting and configurations.

---

## **1. Checking Network Configuration**

### **Check IP Address and Network Interfaces**

- **View all network interfaces and their IPs:**
    
    ```bash
    ip a
    ```
    
- **Alternative command:**
    
    ```bash
    ifconfig
    ```
    
    (If not installed, use `sudo apt install net-tools`.)
    
- **Show only IPv4 addresses:**
    
    ```bash
    hostname -I
    ```
    
- **Find your public IP address:**
    
    ```bash
    curl ifconfig.me
    ```
    

### **Check Default Gateway**

```bash
ip route show
```

or

```bash
route -n
```

### **Check DNS Configuration**

```bash
cat /etc/resolv.conf
```

---

## **2. Testing Network Connectivity**

### **Check Internet Connection**

```bash
ping -c 4 google.com
```

### **Check If a Specific Port Is Open (TCP or UDP)**

```bash
nc -zv google.com 80
```

or

```bash
telnet google.com 80
```

(If `telnet` is missing, install with `sudo apt install telnet`.)

### **Check If a Host is Reachable**

```bash
ping -c 4 192.168.1.1
```

### **Traceroute – Check Route to a Destination**

```bash
traceroute google.com
```

(Install with `sudo apt install traceroute` if not available.)

### **MTR – Continuous Route Tracking**

```bash
mtr google.com
```

(Install with `sudo apt install mtr` if not available.)

---

## **3. Managing Network Interfaces**

### **Enable or Disable a Network Interface**

- **Disable an interface:**
    
    ```bash
    sudo ip link set eth0 down
    ```
    
- **Enable an interface:**
    
    ```bash
    sudo ip link set eth0 up
    ```
    

### **Assign a Static IP Address (Temporary)**

```bash
sudo ip addr add 192.168.1.100/24 dev eth0
```

### **Assign a Default Gateway (Temporary)**

```bash
sudo ip route add default via 192.168.1.1
```

### **Assign a DNS Server (Temporary)**

```bash
echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf
```

---

## **4. Configuring Static IP Permanently**

### **For Debian/Ubuntu (Edit `/etc/netplan/` Configuration File)**

1. Open the netplan config file (usually in `/etc/netplan/`):
    
    ```bash
    sudo nano /etc/netplan/01-netcfg.yaml
    ```
    
2. Add or modify the network configuration:
    
    ```yaml
    network:
      ethernets:
        eth0:
          dhcp4: no
          addresses: [192.168.1.100/24]
          gateway4: 192.168.1.1
          nameservers:
            addresses: [8.8.8.8, 8.8.4.4]
      version: 2
    ```
    
3. Apply changes:
    
    ```bash
    sudo netplan apply
    ```
    

### **For RHEL/CentOS (Edit `/etc/sysconfig/network-scripts/ifcfg-eth0`)**

1. Open the config file:
    
    ```bash
    sudo nano /etc/sysconfig/network-scripts/ifcfg-eth0
    ```
    
2. Modify or add:
    
    ```
    BOOTPROTO=none
    IPADDR=192.168.1.100
    NETMASK=255.255.255.0
    GATEWAY=192.168.1.1
    DNS1=8.8.8.8
    DNS2=8.8.4.4
    ONBOOT=yes
    ```
    
3. Restart networking:
    
    ```bash
    sudo systemctl restart NetworkManager
    ```
    

---

## **5. Checking Open Ports and Listening Services**

### **List Open Ports**

```bash
ss -tuln
```

### **Check What Service is Using a Port**

```bash
sudo netstat -tulnp | grep :80
```

or

```bash
sudo lsof -i :80
```

---

## **6. Managing Firewall Rules**

### **Check Firewall Status**

#### **For UFW (Ubuntu/Debian)**

```bash
sudo ufw status
```

#### **For Firewalld (RHEL/CentOS/Fedora)**

```bash
sudo firewall-cmd --state
```

### **Allow or Deny Ports**

#### **For UFW:**

- Allow HTTP:
    
    ```bash
    sudo ufw allow 80/tcp
    ```
    
- Allow SSH:
    
    ```bash
    sudo ufw allow ssh
    ```
    
- Deny a port:
    
    ```bash
    sudo ufw deny 8080
    ```
    
- Enable firewall:
    
    ```bash
    sudo ufw enable
    ```
    

#### **For Firewalld:**

- Open HTTP port:
    
    ```bash
    sudo firewall-cmd --add-service=http --permanent
    sudo firewall-cmd --reload
    ```
    
- Open a custom port:
    
    ```bash
    sudo firewall-cmd --add-port=8080/tcp --permanent
    sudo firewall-cmd --reload
    ```
    

---

## **7. Network Troubleshooting Commands**

### **Find Network Issues (Common Debugging Commands)**

- **Check IP and routing:**
    
    ```bash
    ip a && ip route show
    ```
    
- **Check if the default gateway is reachable:**
    
    ```bash
    ping -c 4 192.168.1.1
    ```
    
- **Check DNS resolution:**
    
    ```bash
    nslookup google.com
    ```
    
- **Check if a specific port is open remotely:**
    
    ```bash
    nc -zv google.com 443
    ```
    
- **Monitor network traffic in real-time:**
    
    ```bash
    sudo tcpdump -i eth0
    ```
    
    (Install with `sudo apt install tcpdump` if not available.)
    

---

## **8. Configuring a Simple Web Server (Using Python)**

To quickly set up a temporary HTTP server:

```bash
python3 -m http.server 8080
```

Now you can access your server at `http://localhost:8080/`.

---

## **9. Network Performance Testing**

### **Test Network Speed with `iperf`**

1. Install **`iperf3`**:
    
    ```bash
    sudo apt install iperf3
    ```
    
2. Start a server on one machine:
    
    ```bash
    iperf3 -s
    ```
    
3. Run the test from another machine:
    
    ```bash
    iperf3 -c <server-ip>
    ```
    

---

## **10. SSH and Remote Access**

### **Connect to a Remote Server**

```bash
ssh user@remote_host
```

Example:

```bash
ssh user@192.168.1.100
```

### **Copy Files Securely Using SCP**

- Copy a file to a remote machine:
    
    ```bash
    scp file.txt user@remote_host:/destination/path
    ```
    
- Copy a file from a remote machine:
    
    ```bash
    scp user@remote_host:/path/to/file.txt .
    ```
    

---

## **Conclusion**

This guide covers **everything** about Linux networking, from checking IPs to configuring firewalls and troubleshooting network issues.