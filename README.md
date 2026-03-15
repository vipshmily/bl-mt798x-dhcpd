# ATF and u-boot for mt798x with DHCPD

A modified version of hanwckf's U-Boot for MT798x by Yuzhii, with support for DHCPD and a beautiful web UI.

Supports GitHub Actions for automatic builds, and can generate both normal and overclocked BL2.

**Warnign: Flashing custom bootloaders can brick your device. Proceed with caution and at your own risk.**

**Version 2026 is in beta, please report any issues you encounter.**

## About bl-mt798x

U-Boot 2025 adds more features:

- System info display
- Factory (RF) update
- Backup download
- Flash editor
- Web terminal
- Environment manager
- Theme manager
- I18N support
- Device reboot

![Version-2025](document/pictures/uboot-2025.png)

You can configure the features you need.

- [x] MTK_DHCPD
  - [x] MTK_DHCPD_ENHANCED
  - [x] MTK_DHCPD_USE_CONFIG_IP
  - MTK_DHCPD_POOL_START_HOST default 100
  - MTK_DHCPD_POOL_SIZE default 101
- Failsafe Web UI style:
  - [x] WEBUI_FAILSAFE_UI_NEW
    - [x] WEBUI_FAILSAFE_I18N
  - [ ] WEBUI_FAILSAFE_UI_GL
  - [ ] WEBUI_FAILSAFE_UI_MTK
- [x] WEBUI_FAILSAFE_ADVANCED - Enable advanced features
  - [ ] WEBUI_FAILSAFE_SIMG - Enable Single Image upgrade
  - [x] WEBUI_FAILSAFE_FACTORY - Enable factory (RF) update
  - [x] WEBUI_FAILSAFE_BACKUP - Enable backup download
  - [x] WEBUI_FAILSAFE_ENV - Enable environment manager
  - [x] WEBUI_FAILSAFE_CONSOLE - Enable web terminal
  - [x] WEBUI_FAILSAFE_FLASH - Enable flash editor

> Enable WEBUI_FAILSAFE_UI_OLD will use the traditional webui interface.

## Prepare

```bash
sudo apt install gcc-aarch64-linux-gnu build-essential flex bison libssl-dev device-tree-compiler qemu-user-static
```

## Build

example:

```bash
chmod +x build.sh
# mt7981, emmc device
BOARD=sn_r1 ./build.sh
# mt7981, spi-nand device, multi-layout device
BOARD=cmcc_a10 MULTI_LAYOUT=1 ./build.sh
# mt7986, spi-nand device, multi-layout device, single image upgrade support
BOARD=ruijie_rg-x60-new MULTI_LAYOUT=1 SIMG=1 ./build.sh
```

> SP1 is a special version based on u-boot 2025.07. For some mt7986 devices, still use the kernel 5.4 firmware, may cause some issues on version 2025, like hwrng worong, in this case, you can try SP1.

- VARIANT (default: default. Optional, for different firmware variants)

| Variant | Description | Adapted Firmware |
| --- | --- | --- |
| default | Recommand for devices with stock/custom partition layout, enable MTK-NMBM, suitable for most users | stock/custom layout firmware |
| nonmbm | Recommand for devices with stock/custom partition layout, with MTK-NMBM disabled | stock/custom layout firmware without MTK-NMBM |
| ubootmod | With some modifications for better compatibility with OpenWrt/ImmortalWrt firmware | ubi/ubootmod layout firmware |
| openwrt | From OpenWrt official respository, it has no failsafe web UI temporarily | OpenWrt official firmware |

> **VARIANT is only work for VERSION 2025/SP1, for other versions, it will be ignored and use default variant.**

---

Other options:

| Option | type | required | default | description |
| --- | --- | --- | --- | --- |
| SOC | string | false | null | Auto detected, you can set SOC=mt7981, SOC=mt7986 or other mt798x platforms |
| MULTI_LAYOUT | boolean | false | 0 | You can set MULTI_LAYOUT=1 to enable multi-layout support |
| FIXED_MTDPARTS | boolean | false | 1 | You can set FIXED_MTDPARTS=0 to make mtdparts editable, but it may cause some issues if you don't know what you are doing, so it's default to 1 to use fixed mtdparts. |
| FSTHEME | string | false | new | You can set FSTHEME=new/gl/mtk to change the failsafe web UI theme, new/gl/mtk |
| SIMG | boolean | false | null | SIMG=1 means enable single image upgrade support in the failsafe web UI, but it may cause some issues if you don't know what you are doing, so it's default to 0 to disable it. |
| CLEAN | boolean | false | null | You can set CLEAN=1 to clean the build environment before build |

> CAN'T ENABLE MULTI_LAYOUT=1 and FIXED_MTDPARTS=0 at the same time

Generated files will be in the `output`

---

## Airoha

It is in beta, please report any issues you encounter.

**Warnign: Flashing custom bootloaders can brick your device. Proceed with caution and at your own risk.**

### Step

```bash
sudo apt install gcc-arm-linux-gnueabi # if you need to build for en7523 devices
```

```bash
cd atf/tools/fiptool
sudo make all
```

```bash
chmod +x airoha.sh
./airoha.sh
```

You can specify the SOC and the BOARD, for example:

```bash
SOC=an7581 BOARD=evb ./airoha.sh
```
