// SPDX-License-Identifier: GPL-2.0
/*
 * Copyright (C) 2022 MediaTek Inc.
 * Author: Sam Shih <sam.shih@mediatek.com>
 */

#include <asm/io.h>
#include <asm/global_data.h>
#include <linux/sizes.h>
#include <linux/types.h>
#include <common.h>
#include <config.h>
#include <dm.h>
#include <button.h>
#include <env.h>
#include <init.h>
#include <linux/delay.h>

#ifndef CONFIG_RESET_BUTTON_LABEL
#define CONFIG_RESET_BUTTON_LABEL "reset"
#endif

#include <mtd.h>
#include <linux/mtd/mtd.h>
#include <nmbm/nmbm.h>
#include <nmbm/nmbm-mtd.h>

DECLARE_GLOBAL_DATA_PTR;

#define	MT7986_BOOT_NOR		0
#define	MT7986_BOOT_SPIM_NAND	1
#define	MT7986_BOOT_EMMC	2
#define	MT7986_BOOT_SNFI_NAND	3

const char *mtk_board_rootdisk(void)
{
	switch ((readl(0x1001f6f0) & 0x300) >> 8) {
	case MT7986_BOOT_NOR:
		return "nor";

	case MT7986_BOOT_SPIM_NAND:
		return "spim-nand";

	case MT7986_BOOT_EMMC:
		return "emmc";

	case MT7986_BOOT_SNFI_NAND:
		return "sd";

	default:
		return "";
	}
}

ulong board_get_load_addr(void)
{
	if (gd->ram_size <= SZ_128M)
		return gd->ram_base;

	if (gd->ram_size <= SZ_256M)
		return gd->ram_top - SZ_64M;

	return gd->ram_base + SZ_256M;
}

int board_init(void)
{
	gd->bd->bi_boot_params = CONFIG_SYS_SDRAM_BASE + 0x100;
	return 0;
}

int board_late_init(void)
{
	struct udevice *dev;

	gd->env_valid = ENV_VALID;
	if (!button_get_by_label(CONFIG_RESET_BUTTON_LABEL, &dev)) {
		puts("reset button found\n");
#ifdef CONFIG_RESET_BUTTON_SETTLE_DELAY
		mdelay(CONFIG_RESET_BUTTON_SETTLE_DELAY);
#endif
		if (button_get_state(dev) == BUTTON_ON) {
			puts("button pushed, resetting environment\n");
			gd->env_valid = ENV_INVALID;
		}
	}
	env_relocate();
	return 0;
}

int board_nmbm_init(void)
{
#ifdef CONFIG_ENABLE_NAND_NMBM
	struct mtd_info *lower, *upper;
	int ret;

	printf("\n");
	printf("Initializing NMBM ...\n");

	mtd_probe_devices();

	lower = get_mtd_device_nm("spi-nand0");
	if (IS_ERR(lower) || !lower) {
		printf("Lower MTD device 'spi-nand0' not found\n");
		return 0;
	}

	ret = nmbm_attach_mtd(lower,
			      NMBM_F_CREATE | NMBM_F_EMPTY_PAGE_ECC_OK,
			      CONFIG_NMBM_MAX_RATIO,
			      CONFIG_NMBM_MAX_BLOCKS, &upper);

	printf("\n");

	if (ret)
		return 0;

	add_mtd_device(upper);
#endif

	return 0;
}