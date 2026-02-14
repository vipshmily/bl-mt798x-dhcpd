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

static int find_pressed_button(struct udevice **devp, const char **labelp)
{
	struct udevice *dev;

	for (uclass_first_device(UCLASS_BUTTON, &dev); dev;
		 uclass_next_device(&dev))
	{
		struct button_uc_plat *plat = dev_get_uclass_plat(dev);
		int state;

		if (!plat || !plat->label)
			continue;

		state = button_get_state(dev);
		if (state == BUTTON_ON) {
			if (devp)
				*devp = dev;
			if (labelp)
				*labelp = plat->label;
			return 1;
		}
	}

	return 0;
}

static int do_glbtn(struct cmd_tbl *cmdtp, int flag, int argc, char *const argv[])
{
	const char *button_label = NULL;
	const char *gpio_label = NULL;
	const char *button_desc = NULL;
	const char *key_env = NULL;
	const char *reset_label = "reset";
	int ret, counter = 0;
	int pressed = 0;
	bool use_gpio = false;
	bool use_button = false;
	bool use_button_gpio = false;
	bool use_reset_button = false;
	bool use_reset_gpio = false;
	bool use_all = false;
	bool active_low = true;
	struct gpio_desc gpio_desc = {0};
	struct gpio_desc button_gpio_desc = {0};
	struct gpio_desc reset_gpio_desc = {0};
	struct udevice *dev = NULL;
	struct udevice *reset_dev = NULL;
	ulong ts;

	led_control("ledblink", "blink_led", "250");

	gpio_power_clr();

	key_env = env_get("glbtn_key");
	if (!key_env)
		key_env = "reset";

	gpio_label = env_get("glbtn_gpio");

	if ((key_env && !strcasecmp(key_env, "all")) ||
		(gpio_label && !strcasecmp(gpio_label, "all")))
		use_all = true;

	if (use_all) {
		pressed = find_pressed_button(&dev, &button_desc);
		if (!pressed) {
			poller_async_register(&led_p, "led_pa");
			poller_call_async(&led_p, 1000000, led_action_post, NULL);
			return CMD_RET_SUCCESS;
		}
	} else {
		button_label = key_env;

		if (gpio_label) {
			ret = setup_gpio_desc(gpio_label, &gpio_desc, active_low);
			if (ret) {
				printf("GPIO '%s' not found (err=%d)\n", gpio_label, ret);
				return CMD_RET_FAILURE;
			}
			use_gpio = true;
		}

		ret = button_get_by_label(button_label, &dev);
		if (ret) {
			ret = setup_gpio_desc(button_label, &button_gpio_desc, active_low);
			if (ret) {
				if (!gpio_label) {
					printf("Button '%s' not found (err=%d)\n", button_label, ret);
					return CMD_RET_FAILURE;
				}
			} else {
				use_button_gpio = true;
			}
		} else {
			use_button = true;
		}

		if (strcasecmp(button_label, reset_label)) {
			ret = button_get_by_label(reset_label, &reset_dev);
			if (ret) {
				ret = setup_gpio_desc(reset_label, &reset_gpio_desc, active_low);
				if (!ret)
					use_reset_gpio = true;
			} else {
				use_reset_button = true;
			}
		}

		if (use_gpio) {
			pressed = get_gpio_pressed(&gpio_desc);
			if (pressed < 0) {
				printf("GPIO '%s' read failed (err=%d)\n", gpio_label, pressed);
				dm_gpio_free(gpio_desc.dev, &gpio_desc);
				if (use_button_gpio)
					dm_gpio_free(button_gpio_desc.dev, &button_gpio_desc);
				return CMD_RET_FAILURE;
			}
			if (pressed > 0)
				button_desc = gpio_label;
		}

		if (!pressed && use_button) {
			pressed = button_get_state(dev) == BUTTON_ON;
			if (pressed)
				button_desc = button_label;
		}

		if (!pressed && use_reset_button) {
			pressed = button_get_state(reset_dev) == BUTTON_ON;
			if (pressed)
				button_desc = reset_label;
		}

		if (!pressed && use_button_gpio) {
			pressed = get_gpio_pressed(&button_gpio_desc);
			if (pressed < 0) {
				printf("GPIO '%s' read failed (err=%d)\n", button_label, pressed);
				dm_gpio_free(button_gpio_desc.dev, &button_gpio_desc);
				if (use_gpio)
					dm_gpio_free(gpio_desc.dev, &gpio_desc);
				return CMD_RET_FAILURE;
			}
			if (pressed > 0)
				button_desc = button_label;
		}

		if (!pressed && use_reset_gpio) {
			pressed = get_gpio_pressed(&reset_gpio_desc);
			if (pressed < 0) {
				printf("GPIO '%s' read failed (err=%d)\n", reset_label, pressed);
				dm_gpio_free(reset_gpio_desc.dev, &reset_gpio_desc);
				if (use_gpio)
					dm_gpio_free(gpio_desc.dev, &gpio_desc);
				if (use_button_gpio)
					dm_gpio_free(button_gpio_desc.dev, &button_gpio_desc);
				return CMD_RET_FAILURE;
			}
			if (pressed > 0)
				button_desc = reset_label;
		}
	}

	if (!pressed) {
		poller_async_register(&led_p, "led_pa");
		poller_call_async(&led_p, 1000000, led_action_post, NULL);
		if (use_gpio)
			dm_gpio_free(gpio_desc.dev, &gpio_desc);
		if (use_button_gpio)
			dm_gpio_free(button_gpio_desc.dev, &button_gpio_desc);
		if (use_reset_gpio)
			dm_gpio_free(reset_gpio_desc.dev, &reset_gpio_desc);
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

		if (use_gpio) {
			val = get_gpio_pressed(&gpio_desc);
			if (val < 0)
				break;
			if (val > 0)
				still_pressed = true;
		}

		if (use_button) {
			if (button_get_state(dev) == BUTTON_ON)
				still_pressed = true;
		}

		if (use_reset_button) {
			if (button_get_state(reset_dev) == BUTTON_ON)
				still_pressed = true;
		}

		if (use_button_gpio) {
			val = get_gpio_pressed(&button_gpio_desc);
			if (val < 0)
				break;
			if (val > 0)
				still_pressed = true;
		}

		if (use_reset_gpio) {
			val = get_gpio_pressed(&reset_gpio_desc);
			if (val < 0)
				break;
			if (val > 0)
				still_pressed = true;
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

	if (use_gpio)
		dm_gpio_free(gpio_desc.dev, &gpio_desc);
	if (use_button_gpio)
		dm_gpio_free(button_gpio_desc.dev, &button_gpio_desc);
	if (use_reset_gpio)
		dm_gpio_free(reset_gpio_desc.dev, &reset_gpio_desc);

	return CMD_RET_SUCCESS;
}

U_BOOT_CMD(
	glbtn, 1, 0, do_glbtn,
	"GL-iNet button check",
	""
);
