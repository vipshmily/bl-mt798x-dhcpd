#include <command.h>
#include <button.h>
#include <exports.h>
#include <linux/delay.h>
#include <poller.h>
#include <time.h>
#include <dm/ofnode.h>
#include <env.h>
#include <dm.h>
#include <dm/uclass.h>
#include <asm/gpio.h>
#include <string.h>
#include <ctype.h>

static struct poller_async led_p;

void led_control(const char *cmd, const char *name, const char *arg)
{
	const char *led = ofnode_conf_read_str(name);
	char buf[128];

	if (!led)
		return;

	sprintf(buf, "%s %s %s", cmd, led, arg);

	run_command(buf, 0);
}

static void gpio_power_clr(void)
{
	ofnode node = ofnode_path("/config");
	char cmd[128];
	const u32 *val;
	int size, i;

	if (!ofnode_valid(node))
		return;

	val = ofnode_read_prop(node, "gpio_power_clr", &size);
	if (!val)
		return;

	for (i = 0; i < size / 4; i++) {
		sprintf(cmd, "gpio clear %u", fdt32_to_cpu(val[i]));
		run_command(cmd, 0);
	}
}

static void led_action_post(void *arg)
{
	led_control("ledblink", "blink_led", "0");
	led_control("led", "blink_led", "on");
}

static int setup_gpio_desc(const char *name, struct gpio_desc *desc, bool active_low)
{
	const char *gpio_name = name;
	char clean_name[64];
	bool had_prefix = false;
	bool effective_active_low = active_low;
	int ret;

	if (!gpio_name)
		return -EINVAL;

	while (*gpio_name && isspace((unsigned char)*gpio_name))
		gpio_name++;

	if (*gpio_name == '!') {
		effective_active_low = !active_low;
		gpio_name++;
		while (*gpio_name && isspace((unsigned char)*gpio_name))
			gpio_name++;
	}

	if (!strncasecmp(gpio_name, "gpio", 4)) {
		gpio_name += 4;
		had_prefix = true;
	} else if (!strncasecmp(gpio_name, "pio", 3)) {
		gpio_name += 3;
		had_prefix = true;
	}

	if (had_prefix) {
		while (*gpio_name && (isspace((unsigned char)*gpio_name) || *gpio_name == ':'))
			gpio_name++;
	}

	if (strchr(gpio_name, ' ') || strchr(gpio_name, '\t')) {
		size_t i = 0;
		const char *p = gpio_name;

		while (*p && i + 1 < sizeof(clean_name)) {
			if (!isspace((unsigned char)*p))
				clean_name[i++] = *p;
			p++;
		}
		clean_name[i] = '\0';
		if (i)
			gpio_name = clean_name;
	}

	ret = dm_gpio_lookup_name(gpio_name, desc);
	if (ret)
		return ret;

	ret = dm_gpio_request(desc, "glbtn");
	if (ret)
		return ret;

	ret = dm_gpio_set_dir_flags(desc, GPIOD_IS_IN |
		(effective_active_low ? GPIOD_ACTIVE_LOW : 0));
	if (ret)
	{
		dm_gpio_free(desc->dev, desc);
		return ret;
	}

	return 0;
}

static int get_gpio_pressed(struct gpio_desc *desc)
{
	int val = dm_gpio_get_value(desc);

	if (val < 0)
		return val;

	return val ? 1 : 0;
}

#define GLBTN_KEYS_MAX 8

struct glbtn_key_item {
	const char *label;
	struct udevice *dev;
	struct gpio_desc gpio;
	bool use_button;
	bool use_gpio;
};

static char *trim_spaces(char *s)
{
	char *end;

	while (*s && isspace((unsigned char)*s))
		s++;
	if (!*s)
		return s;
	end = s + strlen(s) - 1;
	while (end > s && isspace((unsigned char)*end))
		*end-- = '\0';
	return s;
}

static bool glbtn_has_label(struct glbtn_key_item *keys, int count, const char *label)
{
	int i;

	for (i = 0; i < count; i++) {
		if (keys[i].label && label && !strcasecmp(keys[i].label, label))
			return true;
	}

	return false;
}

static void glbtn_free_keys(struct glbtn_key_item *keys, int count)
{
	int i;

	for (i = 0; i < count; i++) {
		if (keys[i].use_gpio)
			dm_gpio_free(keys[i].gpio.dev, &keys[i].gpio);
	}
}

static int glbtn_add_key(struct glbtn_key_item *keys, int *count,
			 const char *label, bool active_low)
{
	int ret;
	struct udevice *dev;
	struct gpio_desc gpio = {0};
	struct glbtn_key_item *item;

	if (*count >= GLBTN_KEYS_MAX)
		return -ENOSPC;

	ret = button_get_by_label(label, &dev);
	if (!ret) {
		item = &keys[(*count)++];
		memset(item, 0, sizeof(*item));
		item->label = label;
		item->dev = dev;
		item->use_button = true;
		return 0;
	}

	ret = setup_gpio_desc(label, &gpio, active_low);
	if (!ret) {
		item = &keys[(*count)++];
		memset(item, 0, sizeof(*item));
		item->label = label;
		item->gpio = gpio;
		item->use_gpio = true;
		return 0;
	}

	return ret;
}

static int glbtn_add_gpio_key(struct glbtn_key_item *keys, int *count,
			      const char *label, bool active_low)
{
	int ret;
	struct gpio_desc gpio = {0};
	struct glbtn_key_item *item;

	if (*count >= GLBTN_KEYS_MAX)
		return -ENOSPC;

	ret = setup_gpio_desc(label, &gpio, active_low);
	if (ret)
		return ret;

	item = &keys[(*count)++];
	memset(item, 0, sizeof(*item));
	item->label = label;
	item->gpio = gpio;
	item->use_gpio = true;
	return 0;
}

static int do_glbtn(struct cmd_tbl *cmdtp, int flag, int argc, char *const argv[])
{
	char *button_label = NULL;
	const char *gpio_label = NULL;
	const char *button_desc = NULL;
	const char *key_env = NULL;
	const char *reset_label = "reset";
	char key_buf[128];
	char gpio_buf[128];
	struct glbtn_key_item keys[GLBTN_KEYS_MAX];
	int key_count = 0;
	int counter = 0;
	int pressed = 0;
	bool active_low = true;
	ulong ts;

	led_control("ledblink", "blink_led", "250");

	gpio_power_clr();

	key_env = env_get("glbtn_key");
	if (!key_env)
		key_env = "reset";

	gpio_label = env_get("glbtn_gpio");

	memset(keys, 0, sizeof(keys));
	if (gpio_label) {
		strncpy(gpio_buf, gpio_label, sizeof(gpio_buf) - 1);
		gpio_buf[sizeof(gpio_buf) - 1] = '\0';
		button_label = strtok(gpio_buf, ",");
		while (button_label) {
			char *label = trim_spaces(button_label);
			if (*label) {
				if (!glbtn_has_label(keys, key_count, label))
					glbtn_add_gpio_key(keys, &key_count, label, active_low);
			}
			button_label = strtok(NULL, ",");
		}
	}

	if (key_env) {
		strncpy(key_buf, key_env, sizeof(key_buf) - 1);
		key_buf[sizeof(key_buf) - 1] = '\0';
		button_label = strtok(key_buf, ",");
		while (button_label) {
			char *label = trim_spaces(button_label);
			if (*label) {
				if (!glbtn_has_label(keys, key_count, label))
					glbtn_add_key(keys, &key_count, label, active_low);
			}
			button_label = strtok(NULL, ",");
		}
	}

	if (key_count == 0)
		glbtn_add_key(keys, &key_count, reset_label, active_low);
	else if (!glbtn_has_label(keys, key_count, reset_label))
		glbtn_add_key(keys, &key_count, reset_label, active_low);

	if (key_count == 0) {
		printf("No valid glbtn_key/glbtn_gpio found\n");
		return CMD_RET_FAILURE;
	}

	if (!pressed) {
		int i;
		for (i = 0; i < key_count; i++) {
			if (keys[i].use_button) {
				pressed = button_get_state(keys[i].dev) == BUTTON_ON;
			} else if (keys[i].use_gpio) {
				pressed = get_gpio_pressed(&keys[i].gpio);
				if (pressed < 0) {
					printf("GPIO '%s' read failed (err=%d)\n",
						keys[i].label, pressed);
					glbtn_free_keys(keys, key_count);
					return CMD_RET_FAILURE;
				}
			}

			if (pressed > 0) {
				button_desc = keys[i].label;
				break;
			}
		}
	}

	if (!pressed) {
		poller_async_register(&led_p, "led_pa");
		poller_call_async(&led_p, 1000000, led_action_post, NULL);
		glbtn_free_keys(keys, key_count);
		return CMD_RET_SUCCESS;
	}

	led_control("ledblink", "blink_led", "500");

	if (!button_desc)
		button_desc = "button";
	printf("%s is pressed for: %2d second(s)", button_desc, counter++);

	ts = get_timer(0);

	while (counter < 4) {
		bool still_pressed = false;
		int val;

		if (!still_pressed) {
			int i;
			for (i = 0; i < key_count; i++) {
				if (keys[i].use_button) {
					if (button_get_state(keys[i].dev) == BUTTON_ON) {
						still_pressed = true;
						break;
					}
				} else if (keys[i].use_gpio) {
					val = get_gpio_pressed(&keys[i].gpio);
					if (val < 0)
						break;
					if (val > 0) {
						still_pressed = true;
						break;
					}
				}
			}
		}

		if (!still_pressed)
			break;
		if (get_timer(ts) < 1000)
			continue;

		ts = get_timer(0);

		printf("\b\b\b\b\b\b\b\b\b\b\b\b%2d second(s)", counter++);
	}

	printf("\n");

	led_control("ledblink", "blink_led", "0");

	if (counter == 4) {
		led_control("led", "system_led", "on");
		run_command("httpd", 0);
	} else {
		led_control("ledblink", "blink_led", "0");
	}

	glbtn_free_keys(keys, key_count);

	return CMD_RET_SUCCESS;
}

U_BOOT_CMD(
	glbtn, 1, 0, do_glbtn,
	"GL-iNet button check",
	""
);
