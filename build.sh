#!/bin/sh

AUTHOR="Yuzhii"

TOOLCHAIN=aarch64-linux-gnu-

# Default selection
VERSION=${VERSION:-2024}
FSTHEME=${FSTHEME:-new1}
fixedparts=${FIXED_MTDPARTS:-1}
multilayout=${MULTI_LAYOUT:-0}

if [ "$VERSION" = "2022" ]; then
    UBOOT_DIR=uboot-mtk-20220606
    ATF_DIR=atf-20220606-637ba581b
elif [ "$VERSION" = "2023" ]; then
    UBOOT_DIR=uboot-mtk-20230718-09eda825
    ATF_DIR=atf-20231013-0ea67d76a
elif [ "$VERSION" = "2024" ]; then
    UBOOT_DIR=uboot-mtk-20230718-09eda825
    ATF_DIR=atf-20240117-bacca82a8
else
    echo "Error: Unsupported VERSION. Please specify VERSION=2022/2023/2024/2025."
    exit 1
fi

if [ "$CLEAN" = "1" ]; then
	if [ -f "$UBOOT_DIR/.config" ]; then
		echo "Cleaning $UBOOT_DIR"
		cd "$UBOOT_DIR"
		make distclean
		cd ..
	else
		echo "$UBOOT_DIR/.config does not exist."
	fi
    if [ -d "$ATF_DIR/build" ]; then
		echo "Cleaning $ATF_DIR" 
		cd "$ATF_DIR"
		make distclean
		cd ..
    else
        echo "$ATF_DIR/build does not exist."
    fi
	echo "Clean done."
    exit 0
fi

if [ -z "$BOARD" ]; then
	echo "Usage: BOARD=<board name> [SOC=mt7981|mt7986|mt7987|mt7988] VERSION=[2022|2023|2024] $0"
	echo "eg: BOARD=cmcc_a10 $0"
	echo "eg: BOARD=sn_r1 VERSION=2023 $0"
	exit 1
fi

echo "======================================================================"
echo "Checking environment..."
echo "======================================================================"

echo "Trying python3..."
command -v python3
[ "$?" != "0" ] && { echo "Error: Python3 is not installed on this system."; exit 0; }

echo "Trying cross compiler..."
command -v "${TOOLCHAIN}gcc"
[ "$?" != "0" ] && { echo "${TOOLCHAIN}gcc not found!"; exit 0; }
export CROSS_COMPILE="$TOOLCHAIN"

# Config Dir
CONFIGS_DIR_DEFAULT="configs"

detect_soc() {
	matched=""
	for dir in "$UBOOT_DIR/$CONFIGS_DIR_DEFAULT" "$UBOOT_DIR/$CONFIGS_DIR_FIT" "$UBOOT_DIR/$CONFIGS_DIR_NONMBM" "$UBOOT_DIR/$CONFIGS_DIR_OPENWRT"; do
		[ -d "$dir" ] || continue
		for file in "$dir"/*_"$BOARD"_defconfig "$dir"/*_"$BOARD"_multi_layout_defconfig; do
			[ -f "$file" ] || continue
			base=$(basename "$file")
			soc=${base%%_"$BOARD"_defconfig}
			if [ "$base" = "$soc" ]; then
				soc=${base%%_"$BOARD"_multi_layout_defconfig}
			fi
			matched="$matched $soc"
		done
	done

	unique=""
	for s in $matched; do
		case " $unique " in
			*" $s "*) ;;
			*) unique="$unique $s" ;;
		esac
	done

	set -- $unique
	count=$#
	if [ "$count" -eq 1 ]; then
		echo "$1"
		return 0
	fi
	if [ "$count" -gt 1 ]; then
		echo "$unique"
		return 2
	fi
	return 1
}

if [ -z "$SOC" ]; then
	SOC_DETECTED=$(detect_soc)
	status=$?
	if [ "$status" -eq 0 ]; then
		SOC="$SOC_DETECTED"
		echo "Auto-detected SOC: $SOC"
	elif [ "$status" -eq 2 ]; then
		echo "Error: Multiple SOC matches for BOARD=$BOARD:$SOC_DETECTED"
		echo "Please set SOC manually."
		exit 1
	else
		echo "Error: Unable to auto-detect SOC for BOARD=$BOARD"
		echo "Please set SOC manually."
		exit 1
	fi
fi

ATF_CFG_SOURCE="${SOC}_${BOARD}_defconfig"
UBOOT_CFG_SOURCE="${SOC}_${BOARD}_defconfig"
UBOOT_CFG_MULTILAYOUT_SOURCE="${SOC}_${BOARD}_multi_layout_defconfig"

# Backup the configuration files in sources
ATF_CFG="${ATF_CFG:-$ATF_CFG_SOURCE}"
UBOOT_CFG="${UBOOT_CFG:-$UBOOT_CFG_SOURCE}"
UBOOT_CFG_MULTILAYOUT="${UBOOT_CFG_MULTILAYOUT:-$UBOOT_CFG_MULTILAYOUT_SOURCE}"

# ATF Config Path
ATF_CFG_PATH_DEFAULT="$ATF_DIR/$CONFIGS_DIR_DEFAULT/$ATF_CFG"
# U-Boot Config Path
UBOOT_CFG_PATH_DEFAULT="$UBOOT_DIR/$CONFIGS_DIR_DEFAULT/$UBOOT_CFG"
UBOOT_CFG_PATH_MULTILAYOUT="$UBOOT_DIR/$CONFIGS_DIR_DEFAULT/$UBOOT_CFG_MULTILAYOUT"

ATF_CFG_PATH=$ATF_CFG_PATH_DEFAULT
UBOOT_CFG_PATH=$UBOOT_CFG_PATH_DEFAULT

if [ "$multilayout" = "1" ]; then
	UBOOT_CFG_PATH=$UBOOT_CFG_PATH_MULTILAYOUT
fi
if [ "$multilayout" = "1" ] && [ ! -f "$UBOOT_CFG_PATH" ]; then
	echo "Warning: Multi layout config not found, will fallback to single-layout.(Y/n):"
	if [ "$SILENT" != "Y" ]; then
		read answer
	fi
	if [ "$answer" = "y" ] || [ "$answer" = "Y" ] || [ "$SILENT" = "Y" ]; then
		multilayout=0
		UBOOT_CFG_PATH=$UBOOT_CFG_PATH_DEFAULT
	else
		echo "Canceled."
	fi
fi

# No fixed-mtdparts or multilayout for EMMC
if grep -Eq "CONFIG_FLASH_DEVICE_EMMC=y|_BOOT_DEVICE_EMMC=y" "$ATF_CFG_PATH" ; then
	fixedparts=0
	multilayout=0
fi

if [ "$fixedparts" = "0" ] && [ "$multilayout" = "1" ]; then
	echo "Error: Multi layout is not compatible with fixed-mtdparts disabled build. Please disable multi layout or enable fixed-mtdparts."
	exit 1
fi

for file in "$ATF_CFG_PATH" "$UBOOT_CFG_PATH"; do
	if [ ! -f "$file" ]; then
		echo "$file not found!"
		exit 1
	fi
done

echo "======================================================================"
echo "Configuration:"
echo "======================================================================"

echo "VERSION: $VERSION"
echo "TARGET: ${SOC}_${BOARD}"
echo "ATF Dir: $ATF_DIR"
echo "U-Boot Dir: $UBOOT_DIR"
echo "ATF CFG: $ATF_CFG_PATH"
echo "U-Boot CFG: $UBOOT_CFG_PATH"
echo "Features: fixed-mtdparts: $fixedparts, multi-layout: $multilayout, theme: $FSTHEME"

echo "======================================================================"
echo "Build u-boot..."
echo "======================================================================"

rm -f "$UBOOT_DIR/u-boot.bin"
cp -f "$UBOOT_CFG_PATH" "$UBOOT_DIR/.config"
if [ "$fixedparts" = "1" ]; then
	echo "Build u-boot with fixed-mtdparts!"
	echo "CONFIG_MEDIATEK_UBI_FIXED_MTDPARTS=y" >> "$UBOOT_DIR/.config"
	echo "CONFIG_MTK_FIXED_MTD_MTDPARTS=y" >> "$UBOOT_DIR/.config"
fi
if [ "$FSTHEME" = "gl" ] || [ "$FSTHEME" = "GL" ]; then
	echo "Build u-boot with gl fstheme!"
fi
if [ "$FSTHEME" = "new1" ] || [ "$FSTHEME" = "NEW1" ]; then
	echo "Build u-boot with new-1 fstheme!"
	echo "CONFIG_WEBUI_FAILSAFE_THEME_NEW1=y" >> "$UBOOT_DIR/.config"
fi
if [ "$FSTHEME" = "new2" ] || [ "$FSTHEME" = "NEW2" ]; then
	echo "Build u-boot with new-2 fstheme!"
	echo "CONFIG_WEBUI_FAILSAFE_THEME_NEW2=y" >> "$UBOOT_DIR/.config"
fi

make -C "$UBOOT_DIR" olddefconfig
make -C "$UBOOT_DIR" clean
make -C "$UBOOT_DIR" -j $(nproc) all
if [ -f "$UBOOT_DIR/u-boot.bin" ]; then
	cp -f "$UBOOT_DIR/u-boot.bin" "$ATF_DIR/u-boot.bin"
	echo "u-boot build done!"
else
	echo "u-boot build fail!"
	exit 1
fi

echo "======================================================================"
echo "Build atf..."
echo "======================================================================"

if [ -e "$ATF_DIR/makefile" ]; then
	ATF_MKFILE="makefile"
else
	ATF_MKFILE="Makefile"
fi
make -C "$ATF_DIR" -f "$ATF_MKFILE" clean CONFIG_CROSS_COMPILER="$TOOLCHAIN" CROSS_COMPILER="$TOOLCHAIN"
rm -rf "$ATF_DIR/build"
make -C "$ATF_DIR" -f "$ATF_MKFILE" "$ATF_CFG" CONFIG_CROSS_COMPILER="$TOOLCHAIN" CROSS_COMPILER="$TOOLCHAIN"
make -C "$ATF_DIR" -f "$ATF_MKFILE" all CONFIG_CROSS_COMPILER="$TOOLCHAIN" CROSS_COMPILER="$TOOLCHAIN" CONFIG_BL33="../$UBOOT_DIR/u-boot.bin" BL33="../$UBOOT_DIR/u-boot.bin" -j $(nproc)

echo "======================================================================"
echo "Copying output files..."
echo "======================================================================"

mkdir -p "output"
if [ -f "$ATF_DIR/build/${SOC}/release/fip.bin" ]; then
	FIP_NAME="fip-${SOC}_${BOARD}_${VERSION}-${AUTHOR}-dhcpd"
	if [ "$fixedparts" = "1" ]; then
		FIP_NAME="${FIP_NAME}-fixed-parts"
	fi
	if [ "$multilayout" = "1" ]; then
		FIP_NAME="${FIP_NAME}-multi-layout"
	fi
	FIP_MD5=$(md5sum "$ATF_DIR/build/${SOC}/release/fip.bin" | awk '{print $1}')
	FIP_NAME="${FIP_NAME}_md5-${FIP_MD5}"
	echo "fip.bin md5sum: $FIP_MD5"
	cp -f "$ATF_DIR/build/${SOC}/release/fip.bin" "output/${FIP_NAME}.bin"
	echo "fip-${SOC}_${BOARD}_${VERSION} build done"
	echo "Output: output/${FIP_NAME}.bin"
else
	echo "fip build fail!"
	exit 1
fi
if grep -Eq "(^_|CONFIG_TARGET_ALL_NO_SEC_BOOT=y)" "$ATF_CFG_PATH"; then
	if [ -f "$ATF_DIR/build/${SOC}/release/bl2.img" ]; then
		BL2_NAME="bl2-${SOC}_${BOARD}_${VERSION}"
		BL2_MD5=$(md5sum "$ATF_DIR/build/${SOC}/release/bl2.img" | awk '{print $1}')
		BL2_NAME="${BL2_NAME}_md5-${BL2_MD5}"
		echo "bl2.img md5sum: $BL2_MD5"
		cp -f "$ATF_DIR/build/${SOC}/release/bl2.img" "output/${BL2_NAME}.img"
		echo "bl2-${SOC}_${BOARD}_${VERSION} build done"
		echo "Output: output/${BL2_NAME}.img"
	else
		echo "bl2 build fail!"
		exit 1
	fi
fi
