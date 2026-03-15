/* SPDX-License-Identifier: GPL-2.0 */
/*
 * Configuration for MediaTek MT7986 SoC
 *
 * Copyright (C) 2022 MediaTek Inc.
 * Author: Sam Shih <sam.shih@mediatek.com>
 */

#ifndef __MT7986_H
#define __MT7986_H

#include <linux/sizes.h>

#define CONFIG_SYS_MMC_ENV_DEV		0

/* Uboot definition */
#define CONFIG_SYS_UBOOT_BASE		CONFIG_SYS_TEXT_BASE

/* DRAM */
#define CONFIG_SYS_SDRAM_BASE		0x40000000

/* Extra environment variables */
#ifdef CONFIG_MTK_DEFAULT_FIT_BOOT_CONF
#define FIT_BOOT_CONF_ENV	"bootconf=" CONFIG_MTK_DEFAULT_FIT_BOOT_CONF "\0"
#else
#define FIT_BOOT_CONF_ENV
#endif

#define CFG_EXTRA_ENV_SETTINGS	\
	FIT_BOOT_CONF_ENV

#endif
