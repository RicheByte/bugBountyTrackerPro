

This guide covers everything about partitioning in Linux, from listing disks to making a partition permanent.

---

## **1. Checking Available Disks and Partitions**

Before partitioning, check the existing disks and partitions using the following commands:

- **List all available disks and partitions:**
    
    ```bash
    lsblk
    ```
    
- **Show detailed information about partitions:**
    
    ```bash
    sudo fdisk -l
    ```
    
- **Check filesystem type for each partition:**
    
    ```bash
    df -T
    ```
    
- **Identify the disk name (e.g., `/dev/sdX` or `/dev/nvme0n1`):**
    
    ```bash
    sudo lsblk -o NAME,FSTYPE,SIZE,MOUNTPOINT,LABEL
    ```
    

---

## **2. Creating a New Partition Using `fdisk`**

### **Step 1: Open `fdisk` for the Disk**

```bash
sudo fdisk /dev/sdX
```

(Replace `/dev/sdX` with the actual disk name, e.g., `/dev/sdb`.)

### **Step 2: Create a New Partition**

- Press **`n`** → Create a new partition
    
- Select **Primary (`p`)** or **Extended (`e`)** (usually **Primary**)
    
- Choose a partition number (default is fine)
    
- Select the starting sector (press **Enter** to accept the default)
    
- Choose the partition size (e.g., `+10G` for a 10GB partition)
    
- Press **Enter**
    

### **Step 3: Save and Exit**

- Press **`w`** → Write changes and exit
    

---

## **3. Formatting the New Partition**

Now that the partition is created, it must be formatted before use.

- **For EXT4 (Recommended for Linux):**
    
    ```bash
    sudo mkfs.ext4 /dev/sdX1
    ```
    
- **For NTFS (For Windows compatibility):**
    
    ```bash
    sudo mkfs.ntfs /dev/sdX1
    ```
    
- **For FAT32 (USB drives or older systems):**
    
    ```bash
    sudo mkfs.vfat -F 32 /dev/sdX1
    ```
    

---

## **4. Mounting the Partition**

To access the new partition, it must be mounted to a directory.

### **Step 1: Create a Mount Point**

```bash
sudo mkdir -p /mnt/my_partition
```

### **Step 2: Mount the Partition**

```bash
sudo mount /dev/sdX1 /mnt/my_partition
```

### **Step 3: Verify the Mount**

```bash
df -h
```

---

## **5. Making the Partition Permanent (Auto-Mount at Boot)**

Mounting will be lost after a reboot unless it is added to **`/etc/fstab`**.

### **Step 1: Get the UUID of the Partition**

```bash
sudo blkid /dev/sdX1
```

Example Output:

```
/dev/sdX1: UUID="abc123-def456" TYPE="ext4"
```

Copy the **UUID** value.

### **Step 2: Edit `/etc/fstab`**

```bash
sudo nano /etc/fstab
```

### **Step 3: Add the Partition to `/etc/fstab`**

Add the following line at the end of the file:

```
UUID=abc123-def456 /mnt/my_partition ext4 defaults 0 2
```

(Replace `abc123-def456` with your actual UUID.)

- For **NTFS**, use:
    
    ```
    UUID=abc123-def456 /mnt/my_partition ntfs defaults 0 0
    ```
    
- For **FAT32**, use:
    
    ```
    UUID=abc123-def456 /mnt/my_partition vfat defaults 0 0
    ```
    

### **Step 4: Save and Exit**

Press **CTRL + X**, then **Y**, then **Enter** to save.

### **Step 5: Reload `fstab` and Test Auto-Mount**

```bash
sudo mount -a
```

Then reboot the system:

```bash
sudo reboot
```

---

## **6. Unmounting and Deleting a Partition**

- **Unmount the partition:**
    
    ```bash
    sudo umount /mnt/my_partition
    ```
    
- **Remove the partition using `fdisk`:**
    
    ```bash
    sudo fdisk /dev/sdX
    ```
    
    - Press **`d`** to delete the partition
        
    - Press **`w`** to save changes
        

---

## **7. Checking and Repairing Partitions**

- **Check the filesystem for errors:**
    
    ```bash
    sudo fsck -y /dev/sdX1
    ```
    
- **Check disk health using SMART monitoring:**
    
    ```bash
    sudo smartctl -a /dev/sdX
    ```
    

---

This guide covers **everything** about partitioning in Linux, from creating a partition to making it permanent. 