
## **1. Checking Disk Space and Usage**

- Show disk space usage for all mounted filesystems:
    
    ```bash
    df -h
    ```
    
- Display disk usage of a specific directory:
    
    ```bash
    du -sh /path/to/directory
    ```
    
- List the sizes of all subdirectories in the current directory:
    
    ```bash
    du -h --max-depth=1
    ```
    
- Find the top 10 largest files in a directory:
    
    ```bash
    find /path/to/directory -type f -exec du -h {} + | sort -rh | head -10
    ```
    
- Show disk usage by file type (e.g., only .log files):
    
    ```bash
    find /path/to/directory -type f -name "*.log" -exec du -ch {} + | tail -1
    ```
    

## **2. Managing Partitions and Filesystems**

- List all partitions and disks:
    
    ```bash
    lsblk
    ```
    
- Display detailed partition information:
    
    ```bash
    fdisk -l
    ```
    
- Check the filesystem type of a partition:
    
    ```bash
    df -T
    ```
    
- Format a partition with EXT4 filesystem:
    
    ```bash
    sudo mkfs.ext4 /dev/sdX
    ```
    
- Format a partition with NTFS (for Windows compatibility):
    
    ```bash
    sudo mkfs.ntfs /dev/sdX
    ```
    

## **3. Mounting and Unmounting Drives**

- Mount a partition:
    
    ```bash
    sudo mount /dev/sdX /mnt
    ```
    
- Unmount a partition:
    
    ```bash
    sudo umount /dev/sdX
    ```
    
- View all mounted filesystems:
    
    ```bash
    mount | column -t
    ```
    
- Automatically mount a drive at boot (edit `/etc/fstab`):
    
    ```bash
    sudo nano /etc/fstab
    ```
    

## **4. Managing SWAP Space**

- Check if swap is enabled:
    
    ```bash
    swapon --show
    ```
    
- Create a swap file (1GB size example):
    
    ```bash
    sudo fallocate -l 1G /swapfile
    sudo chmod 600 /swapfile
    sudo mkswap /swapfile
    sudo swapon /swapfile
    ```
    
- Make swap permanent (edit `/etc/fstab`):
    
    ```bash
    echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
    ```
    
- Disable swap:
    
    ```bash
    sudo swapoff -a
    ```
    

## **5. Checking Disk Health and Performance**

- Check disk health using SMART:
    
    ```bash
    sudo smartctl -H /dev/sdX
    ```
    
- Perform a detailed disk check:
    
    ```bash
    sudo smartctl -a /dev/sdX
    ```
    
- Measure disk read speed:
    
    ```bash
    sudo hdparm -Tt /dev/sdX
    ```
    

## **6. Repairing Filesystems**

- Check and repair a filesystem:
    
    ```bash
    sudo fsck -y /dev/sdX
    ```
    
- Check disk for bad blocks:
    
    ```bash
    sudo badblocks -sv /dev/sdX
    ```
    

## **7. Managing Logical Volumes (LVM)**

- Display volume groups:
    
    ```bash
    vgdisplay
    ```
    
- Display logical volumes:
    
    ```bash
    lvdisplay
    ```
    
- Extend a logical volume:
    
    ```bash
    sudo lvextend -L +10G /dev/volume_group/logical_volume
    sudo resize2fs /dev/volume_group/logical_volume
    ```
    

---

This guide covers **disk and storage management** essentials! 