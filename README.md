# ATF and u-boot for mt798x with DHCPD

A modified version of hanwckf's U-Boot for MT798x by Yuzhii, with support for DHCPD and a beautiful web UI. (Builds available for versions 2022/2023/2024)

**Warnign: Flashing custom bootloaders can brick your device. Proceed with caution and at your own risk.**

## About bl-mt798x

- <https://cmi.hanwckf.top/p/mt798x-uboot-usage>

Now U-Boot 2022 and 2023 is **not maintained**(include Version2022/2023/2024), please use U-Boot 2025 if you want to use the latest features and improvements.

> Version-2022 WEB UI

![Version-2022](document/pictures/uboot-2022.png)

> Version-2023/2024 WEB UI

![Version-2023/2024](document/pictures/uboot-2023.png)

## Prepare

```bash
sudo apt install gcc-aarch64-linux-gnu build-essential flex bison libssl-dev device-tree-compiler qemu-user-static
```

## Build

```bash
Usage: SOC=[mt7981|mt7986] BOARD=<board name> MULTI_LAYOUT=[0|1] ./build.sh
eg: SOC=mt7981 BOARD=360t7 ./build.sh
eg: SOC=mt7981 BOARD=wr30u MULTI_LAYOUT=1 ./build.sh
eg: SOC=mt7981 BOARD=cmcc_rax3000m-emmc ./build.sh
eg: SOC=mt7986 BOARD=redmi_ax6000 MULTI_LAYOUT=1 ./build.sh
eg: SOC=mt7986 BOARD=jdcloud_re-cp-03 ./build.sh
```

- Version (default: 2025. Optional, for different versions of ATF and U-Boot)

| Version | ATF | UBOOT |
| --- | --- | --- |
| 2022 | 20220606-637ba581b | 20220606 |
| 2023 | 20231013-0ea67d76a | 20230718-09eda825 |
| 2024 | 20240117-bacca82a8 | 20230718-09eda825 |

---

## Acknowledgement

- [hanwckf](https://github.com/hanwckf/bl-mt798x)
- [mtk-openwrt](https://github.com/mtk-openwrt)
- [u-boot](https://github.com/u-boot/u-boot)
- [Tianling](https://blog.imouto.in/)

---

### xiaomi-wr30u multi-layout uboot firmware compatibility

|Firmware type|uboot (default)|uboot (immortalwrt-112m)|uboot (qwrt)|
|:----:|:----:|:----:|:----:|
|[xiaomi stock mtd8/mtd9](https://github.com/hanwckf/xiaomi-router-stock-ubi-bin/tree/main/xiaomi-wr30u)|√|×|×|
|[immortalwrt-mt798x stock](https://github.com/hanwckf/immortalwrt-mt798x/blob/openwrt-21.02/target/linux/mediatek/files-5.4/arch/arm64/boot/dts/mediatek/mt7981-xiaomi-mi-router-wr30u-stock.dts)|√|×|×|
|[OpenWrt stock](https://github.com/openwrt/openwrt/blob/main/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-stock.dts)|√|×|×|
|[immortalwrt stock](https://github.com/immortalwrt/immortalwrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-stock.dts)|√|×|×|
|[X-Wrt stock](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-stock.dts)|√|×|×|
|[immortalwrt-mt798x 112m](https://github.com/hanwckf/immortalwrt-mt798x/blob/openwrt-21.02/target/linux/mediatek/files-5.4/arch/arm64/boot/dts/mediatek/mt7981-xiaomi-mi-router-wr30u-112m.dts)|×|√|×|
|[GL.iNet by 237176253](https://www.right.com.cn/forum/thread-8297881-1-1.html)|×|√|×|
|[X-Wrt 112m nmbm](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-112m-nmbm.dts)|×|√|×|
|[OpenWrt 112m nmbm](https://github.com/openwrt/openwrt/blob/main/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-112m-nmbm.dts)|×|√|×|
|[immortalwrt 112m nmbm](https://github.com/immortalwrt/immortalwrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-112m-nmbm.dts)|×|√|×|
|[X-Wrt 112m nmbm](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-112m-nmbm.dts)|×|√|×|
|[QWRT](https://www.right.com.cn/forum/thread-8284824-1-1.html)|×|×|√|
|[OpenWrt ubootmod](https://github.com/openwrt/openwrt/blob/main/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-ubootmod.dts)|×|×|×|
|[immortalwrt ubootmod](https://github.com/immortalwrt/immortalwrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-ubootmod.dts)|×|×|×|
|[X-Wrt ubootmod](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7981b-xiaomi-mi-router-wr30u-ubootmod.dts)|×|×|×|

### redmi-ax6000 multi-layout uboot firmware compatibility

|Firmware type|uboot (default)|uboot (immortalwrt-110m)|
|:----:|:----:|:----:|
|[xiaomi stock mtd8/mtd9](https://github.com/hanwckf/xiaomi-router-stock-ubi-bin/tree/main/redmi-ax6000)|√|×|
|[immortalwrt-mt798x stock](https://github.com/hanwckf/immortalwrt-mt798x/blob/openwrt-21.02/target/linux/mediatek/files-5.4/arch/arm64/boot/dts/mediatek/mt7986a-xiaomi-redmi-router-ax6000-stock.dts)|√|×|
|[OpenWrt stock](https://github.com/openwrt/openwrt/blob/main/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-stock.dts)|√|×|
|[immortalwrt stock](https://github.com/immortalwrt/immortalwrt/blob/master/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-stock.dts)|√|×|
|[X-Wrt stock](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-stock.dts)|√|×|
|[immortalwrt-mt798x](https://github.com/hanwckf/immortalwrt-mt798x/blob/openwrt-21.02/target/linux/mediatek/files-5.4/arch/arm64/boot/dts/mediatek/mt7986a-xiaomi-redmi-router-ax6000.dts)|×|√|
|[GL.iNet by 237176253](https://www.right.com.cn/forum/thread-8297881-1-1.html)|×|√|
|[X-Wrt ubootlayout](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-ubootlayout.dts)|×|√|
|[OpenWrt ubootmod](https://github.com/openwrt/openwrt/blob/main/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-ubootmod.dts)|×|×|
|[immortalwrt ubootmod](https://github.com/immortalwrt/immortalwrt/blob/master/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-ubootmod.dts)|×|×|
|[X-Wrt ubootmod](https://github.com/x-wrt/x-wrt/blob/master/target/linux/mediatek/dts/mt7986a-xiaomi-redmi-router-ax6000-ubootmod.dts)|×|×|
