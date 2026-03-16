# SPDX-License-Identifier: GPL-2.0

ifeq ($(CONFIG_SPL_BUILD),)

FAILSAFE_FSDATA_DIR := fsdata

ifeq ($(CONFIG_WEBUI_FAILSAFE_THEME_NEW1),y)
FAILSAFE_FSDATA_DIR := fsdata-new1
else ifeq ($(CONFIG_WEBUI_FAILSAFE_THEME_NEW2),y)
FAILSAFE_FSDATA_DIR := fsdata-new2
else ifeq ($(CONFIG_WEBUI_FAILSAFE_THEME_NEW3),y)
FAILSAFE_FSDATA_DIR := fsdata-new3
endif

obj-y += $(FAILSAFE_FSDATA_DIR)/

obj-y += fs.o failsafe.o

endif
