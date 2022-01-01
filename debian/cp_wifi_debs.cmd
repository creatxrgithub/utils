#!/usr/bin/env bash
set -e

### in order to setup wifi without wired network, there is wifi driver in your install media: "bcmwl-kernel-source".
### this script is to copy the file and its dependents together from the install media.
### so that you can use "sudo dpkg -i *.deb" to install them in a directory.
### to get debian's driver , it's in the media which has nonfree and which is not a live-cd.



# change your install media's location

install_media_root='/mnt/Debian 11.0.0 amd64 1/pool'
to_dir='.'


find "${install_media_root}" -name 'bcmwl-kernel-source*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'build-essential*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'dkms*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'dpkg-dev*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'g++*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'g++-7*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'gcc*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'gcc-7*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'install_wifi.txt*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libasan*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libatomic1*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libc6-dev*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libc-dev-bin*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libcilkrts5*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libgcc*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libitm1*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'liblsan0*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libmpx2*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libquadmath0*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libstdc++*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libtsan*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libubsan*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'linux-libc-dev*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'make*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'binutils*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libbinutils*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libctf*.deb' -exec cp {} "${to_dir}"/ \;
find "${install_media_root}" -name 'libcrypt-dev*.deb' -exec cp {} "${to_dir}"/ \;
