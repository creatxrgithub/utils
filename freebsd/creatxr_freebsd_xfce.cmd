#!/usr/bin/env bash



### it's freebsd customsized setup script. it could run on "sh" now.
### it setup xfce, dual video card (nvidia and intel), cjk fonts, fcitx5, firefox and chromium.
### (fcitx5 may miss some env settings. install zh-ibus-rime and then remove ibus and re-login, it works.)
### i perfer modify "/usr/local/share/rime-data/default.yaml" to use " - schema: wubi_trad".
### for yourself, it needs to modify variable value:  YOUR_USER_NAME, and values in XORG_CONF_FILE_NAME config. e.g. BusID
### use command: "pciconf -lv | grep -A 4 vgapci"


### 在輸入用戶名校驗處做了更改，可以運行在 Bourne Shell 卽 sh 上
### changed user name verify implement to run on bourne shell (sh) by change the first line "bash" to "sh".


### make usb stick on linux
# https://www.debian.org/releases/jessie/amd64/ch04s03.html.en
# cp debian.iso /dev/sdX
# sync
### https://www.freebsd.org/releases/13.0R/announce/
# on debian/ubuntu
# Be careful to make sure you get the target (of=) correct.
# dd if=FreeBSD-13.0-RELEASE-amd64-bootonly.iso of=/dev/sdb bs=1m conv=sync


### 必須要有一個 freebsd-boot 分區（類型），而且必須是 512KB 大小。
### must have a patition of freebsd-boot with size 512KB only.
### 組合鍵 ctrl+alt+f1 能回到 console 界面
### switch to console by ctrl+alt+f1
### 由於 freebsd 安裝時沒有格式化分區的功能，所以重裝系統時可用改變分區格式的方法 freebsd-zfs 和 freebsd-ufs 間輪替，或刪除分區再重建。
### cause freebsd does't have format partition option while installing, to install a "clean" system, you can delete and recreate the partition.


### install fusefs-lkl first to access to linux's parition, so that you could copy this script from there.
### pkg install -y fusefs-lkl
### kldload fusefs
### e.g. lklfuse -o type=btrfs /dev/ada0p6 /mnt
### install bash
### pkg install -y bash


YOUR_USER_NAME='creatxr'


YOUR_USER_NAME=''
#while [[ ! ${YOUR_USER_NAME} =~ ^[0-9A-Za-z\_\-]{5,32}$ ]]; do
#while [ "$(echo ${YOUR_USER_NAME} | grep -E '^[0-9A-Za-z\_\-]{5,32}$')" = '' ]; do #比較字符串要把輸出的匹配用雙引號括起來
while [ -z "$(echo ${YOUR_USER_NAME} | grep -E '^[0-9A-Za-z\_\-]{5,32}$')" ]; do #比較字符串要把輸出的匹配用雙引號括起來
    read -p "input  your user name : " YOUR_USER_NAME
done



# su -
# su - root
# or login to root account to execute this script
# to install xfce after installed freebsd


freebsd-update fetch
freebsd-update install


pkg install -y xorg
pkg install -y xfce
pkg install -y slim slim-themes



# Configure Startup Services
# edit /etc/rc.conf
# or in the terminal, type each command one line at the time as root user:

sysrc dbus_enable=yes
sysrc hald_enable=yes
sysrc slim_enable=yes
sysrc sound_load=yes
sysrc snd_hda_load=yes



pkg install -y xfce4-pulseaudio-plugin
pkg install -y xfce4-goodies



pkg install -y firefox
## shared memory support must be enabled to run chromium
pkg install -y chromium
sysctl kern.ipc.shm_allow_removed=1
#pkg install -y libreoffice gimp vlc
#pkg install -y thunderbird
#pkg install -y p7zip p7zip-codec-rar xarchiver



## 安裝 nvidia 的驅動以驅動雙顯卡
## 查看顯卡 pciconf -lv | grep -A 4 vgapci
## 需混和驅動 nvidia-hybrid-graphics
## Driver 應該設成 "modesetting"
## 需 drm-fbsd13-kmod
## kld_list 中要包含 "linux nvidia-modeset i915kms"
## 啓用 linux_enable
### 不能使用 cannot use "pkg install -y X11/nvidia-hybrid-graphics"

#pkg install -y nvidia-hybrid-graphics-0.5
pkg install -y nvidia-hybrid-graphics
pkg install -y drm-fbsd13-kmod
#For amdgpu: kld_list="amdgpu"
#For Intel: kld_list="i915kms"
#For radeonkms: kld_list="radeonkms"
pkg install -y xf86-video-intel
pkg install -y libva-intel-driver
pkg install -y libva-intel-hybrid-driver
sysrc kld_list+=linux
sysrc kld_list+=nvidia-modeset
sysrc kld_list+=i915kms
sysrc linux_enable=yes
sysrc nvidia_xorg_enable=yes
#service nvidia_xorg start


### the driver cannot set to "intel" or "drm" or "i915kms" or "mesa". otherwise it cannot startx (startxfce4) or xwindow is blank. (if set Device to "Card1", it does not work) the driver can only set to "scfb".
## create /usr/local/etc/X11/xorg.conf.d/driver-nvidia.conf
## 如果已經安裝了 sudo 則在 tee 前加 sudo

XORG_CONF_FILE_NAME='/usr/local/etc/X11/xorg.conf.d/driver-nvidia.conf'

#some said "modesetting" is for intel card, "nvidia" is for nvidia card. so, i modified it. after reboot, i compared the two configs "glxinfo". it's the same.

echo 'Section "Device"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Identifier "Card0"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    VendorName "NVIDIA Corporation"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Driver "nvidia"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    BusID "PCI:1:0:0"' | tee -a ${XORG_CONF_FILE_NAME}
echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}

echo 'Section "Device"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Identifier "Card1"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    VendorName "Intel Corporation"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Driver "modesetting"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    BusID "PCI:0:2:0"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Option "DPMS"' | tee -a ${XORG_CONF_FILE_NAME}
echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}

echo 'Section "Screen"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Identifier "Screen0"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Device "Card1"' | tee -a ${XORG_CONF_FILE_NAME}
echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}

echo 'Section "Screen"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Identifier "Screen1"' | tee -a ${XORG_CONF_FILE_NAME}
echo '    Device "Card1"' | tee -a ${XORG_CONF_FILE_NAME}
echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}
echo '' | tee -a ${XORG_CONF_FILE_NAME}

#echo 'Section "Device"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Identifier "Card0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    VendorName "NVIDIA Corporation"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Driver "modesetting"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    BusID "PCI:1:0:0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}

#echo 'Section "Device"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Identifier "Card1"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    VendorName "Intel Corporation"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Driver "scfb"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    BusID "PCI:0:2:0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Option "DPMS"' | tee -a ${XORG_CONF_FILE_NAME}
#echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}

#echo 'Section "Screen"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Identifier "Screen0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Device "Card0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}

#echo 'Section "Screen"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Identifier "Screen1"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Device "Card0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}


## create /usr/local/etc/X11/xorg.conf.d/driver-scfb.conf
#Section "Device"
#    Identifier "card0"
#    BusID "PCI:0:2:0"
#    Driver "scfb"
#EndSection

#XORG_CONF_FILE_NAME='/usr/local/etc/X11/xorg.conf.d/driver-scfb.conf'
#echo 'Section "Device"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Identifier "card0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    Driver "scfb"' | tee -a ${XORG_CONF_FILE_NAME}
#echo '    BusID "PCI:0:2:0"' | tee -a ${XORG_CONF_FILE_NAME}
#echo 'EndSection' | tee -a ${XORG_CONF_FILE_NAME}
#echo '' | tee -a ${XORG_CONF_FILE_NAME}



## 安裝顯卡測試軟件，測試的命令：
# glxgears
# nvrun-vgl glxgears
pkg install -y mesa-demos







# where <username> is the user name you provided during the FreeBSD installation
# for me username is 'creatxr', not 'root'
# vi /home/<username>/.xinitrc
# add line below:
# exec startxfce4

## to login root from slim:
# echo 'exec startxfce4' > /root/.xinitrc

#echo 'exec startxfce4' > /home/creatxr/.xinitrc
echo 'exec startxfce4' > /home/"${YOUR_USER_NAME}"/.xinitrc



### e.g. lklfuse -o type=btrfs /dev/ada0p8 /mnt
pkg install -y fusefs-libs3 fusefs-lkl fusefs-ext2 fusefs-exfat fusefs-ntfs fusefs-ntfs-compression fusefs-rar2fs fusefs-sshfs fusefs-afuse
sysrc kld_list+=fusefs
sysrc fusefs_enable=yes

### for user mount, thunar could mount but cannot umount. so, just add user to umount's group or chmod permissions of umount.
### but it has a bug now, it will cause huge cpu occupy.





### it seems that it's not necessary:
# uncomment "/media -media -nosuid,-m=770,-L=en_US.UTF-8" in "/etc/auto_master"
#sysrc autofs_enable=yes
#echo '/media -media -nosuid,noatime,autoro,-m=770,-L=en_US.UTF-8' | tee -a /etc/auto_master
#echo 'vfs.usermount=1' | tee -a /etc/sysctl.conf
#echo 'autofs_load=yes' | tee -a /boot/loader.con
#pw groupmod operator -m ${YOUR_USER_NAME}
#pw groupmod wheel -m ${YOUR_USER_NAME}
## pw groupmod wheel -d <username> ## to remove users from group
## https://www.freebsd.org/cgi/man.cgi?query=pw&sektion=8



### 如果無法選擇輸入法，應該是環境變量沒設好，安裝 zh-ibus-rime 就幫你自動設好了，然後刪了 ibus 就行了。需要重新登錄才能生效。
pkg install -y zh-CJKUnifonts
pkg install -y fcitx5 fcitx5-configtool fcitx5-gtk zh-fcitx5-rime zh-rime-wubi


# cp wubi*.yaml /usr/local/share/rime-data/
# in
# /usr/local/share/rime-data/default.yaml
# add
# - schema: wubi_trad


#Message from fcitx5-5.0.4_2:

#--
#Remember to set the environment variable XMODIFIERS:

# csh/tcsh: setenv XMODIFIERS @im=fcitx
# sh/bash: export XMODIFIERS='@im=fcitx'

#For GTK+ programs, you may want to set:

# csh/tcsh: setenv GTK_IM_MODULE fcitx/xim
# sh/bash: export GTK_IM_MODULE=fcitx/xim

#For Qt programs, you may want to set:

# csh/tcsh: setenv QT_IM_MODULE fcitx
# sh/bash: export QT_IM_MODULE=fcitx

#To start fcitx with your desktop, just

# cp /usr/local/share/applications/org.fcitx.Fcitx5.desktop \
#    ~/.config/autostart/






#Message from ibus-1.5.24:

#--
#ibus installation finished. To use ibus, please do the following:

#If you are using bash, please add following lines to your $HOME/.bashrc:

#export XIM=ibus
#export GTK_IM_MODULE=ibus
#export QT_IM_MODULE=ibus
#export XMODIFIERS=@im=ibus
#export XIM_PROGRAM="ibus-daemon"
#export XIM_ARGS="--daemonize --xim"

#If you are using tcsh, please add following lines to your $HOME/.cshrc:

#setenv XIM ibus
#setenv GTK_IM_MODULE ibus
#setenv QT_IM_MODULE ibus
#setenv XMODIFIERS @im=ibus
#setenv XIM_PROGRAM ibus-daemon
#setenv XIM_ARGS "--daemonize --xim"

#If you are using KDE4, you may create a shell script in $HOME/.kde4/env
#($HOME/.config/plasma-workspace/env for Plasma) and add following lines:

##!/bin/sh
#export XIM=ibus
#export GTK_IM_MODULE=ibus
#export QT_IM_MODULE=ibus
#export XMODIFIERS=@im=ibus
#export XIM_PROGRAM="ibus-daemon"
#export XIM_ARGS="--daemonize --xim"

#Following input methods/engines are available in ports:

#chinese/ibus-chewing Chewing engine for IBus
#chinese/ibus-libpinyin Intelligent Pinyin engine based on libpinyin
#chinese/ibus-pinyin The PinYin input method
#japanese/ibus-anthy Anthy engine for IBus
#japanese/ibus-mozc Mozc engine for IBus
#japanese/ibus-skk SKK engine for IBus
#korean/ibus-hangul Hangul engine for IBus
#textproc/ibus-kmfl KMFL IMEngine for IBus framework
#textproc/ibus-m17n m17n IM engine for IBus framework
#textproc/ibus-table Table based IM framework for IBus
#textproc/ibus-typing-booster    Faster typing by context sensitive completion

#If ibus cannot start or the panel does not appear, please ensure
#that you are using up-to-date python.







pkg install -y sudo
# visudo
# add lines below:
#  root ALL=(ALL) ALL
# <your username> ALL=(ALL) ALL
echo "${YOUR_USER_NAME} ALL=(ALL) ALL" | tee -a /usr/local/etc/sudoers


## now you could login with username 'creatxr'


reboot









### not work

# grub dual boot freebsd and linux by grub
# menuentry 'FreeBSD' {
# insmod ufs2
# set root='(hd0,gpt5)'
# chainloader /boot/loader.efi
# }
# then update grub with update-grub2



# FreeBSD aware UEFI

## We mount the EFI partition on /boot/efi similarly to Linux.
#mkdir /boot/efi
#echo '/dev/ada0p1 /boot/efi msdosfs rw,noatime 0 0' >> /etc/fstab
#mount /boot/efi
#
## Install the FreeBSD UEFI loader.
#mkdir /boot/efi/EFI/freebsd
#cp /boot/boot1.efi /boot/efi/EFI/freebsd/bootx64.efi
#
## Create the boot variable.
#efibootmgr -c -l /boot/efi/EFI/freebsd/bootx64.efi -L "FreeBSD"
#
## Check the variable number for the new boot variable and activate it.
#efibootmgr
#efibootmgr -a 15
#
## Change the boot order to leave Debian and GRUB in charge.
#efibootmgr -o 14,15


# https://tldp.org/HOWTO/Linux+FreeBSD-3.html
# sharing swap space between Linux and FreeBSD
# 由於 FreeBSD 可以使用任何形式的分區作爲 swap 分區。而 Linux 需要在 swap 分區上設定一個特殊標識。
# vi /etc/fstab
# add line below for swap patition (e.g. hda6 is swap patition)
# /dev/hda6 none swap sw 0 0

# While FreeBSD can use any type of partition as swap space, Linux needs a special signature in the swap partition. This signature is made by mkswap. FreeBSD ruins this signature when it uses the shared swap partition, so you will have to run mkswap each time you boot into Linux. To do this automagically you have to find the script that runs swapon at boot time. In Red Hat Linux it is /etc/rc.d/rc.sysinit. Put the following line into that file just before swapon -a:

# awk -- '/swap/ && ($1 !~ /#/) { system("mkswap "$1"") }' /etc/fstab
