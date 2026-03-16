function normalizeLang(n) {
    if (!n) return "en";
    var t = String(n).toLowerCase();
    return t.indexOf("zh") === 0 ? "zh-cn" : "en"
}

function detectLang() {
    var t, n;
    try {
        if (t = localStorage.getItem("lang"), t) return normalizeLang(t)
    } catch (i) { }
    return n = [], navigator.languages && navigator.languages.length ? n = navigator.languages : navigator.language && (n = [navigator.language]), normalizeLang(n[0])
}

function detectTheme() {
    try {
        var n = localStorage.getItem("theme");
        if (n) return n
    } catch (t) { }
    return "auto"
}

function t(n) {
    var t = APP_STATE.lang || "en";
    return I18N[t] && I18N[t][n] !== undefined ? I18N[t][n] : I18N.en && I18N.en[n] !== undefined ? I18N.en[n] : n
}

function applyI18n(n) {
    for (var c, u, i, l, f, r, a, e, v, y, s = n || document, h = s.querySelectorAll("[data-i18n]"), o = 0; o < h.length; o++) c = h[o].getAttribute("data-i18n"), h[o].textContent = t(c);
    for (u = s.querySelectorAll("[data-i18n-html]"), i = 0; i < u.length; i++) l = u[i].getAttribute("data-i18n-html"), u[i].innerHTML = t(l);
    for (f = s.querySelectorAll("[data-i18n-attr]"), r = 0; r < f.length; r++) a = f[r].getAttribute("data-i18n-attr"), e = a.split(":"), e.length >= 2 && (v = e[0], y = e.slice(1).join(":"), f[r].setAttribute(v, t(y)))
}

function setLang(n) {
    APP_STATE.lang = normalizeLang(n);
    try {
        localStorage.setItem("lang", APP_STATE.lang)
    } catch (t) { }
    applyI18n(document);
    updateDocumentTitle()
}

function setTheme(n) {
    APP_STATE.theme = n || "auto";
    try {
        localStorage.setItem("theme", APP_STATE.theme)
    } catch (i) { }
    var t = document.documentElement;
    APP_STATE.theme === "auto" ? t.removeAttribute("data-theme") : t.setAttribute("data-theme", APP_STATE.theme)
}

function updateDocumentTitle() {
    if (APP_STATE.page) {
        var n = APP_STATE.page + ".title";
        if (I18N[APP_STATE.lang] && I18N[APP_STATE.lang][n]) {
            document.title = t(n);
            return
        }
        APP_STATE.page === "flashing" ? document.title = t("flashing.title.in_progress") : APP_STATE.page === "booting" && (document.title = t("booting.title.in_progress"))
    }
}

function ensureBranding() {
    var t = document.getElementById("version"),
        n, i;
    t && ((n = t.nextElementSibling, n && n.classList && n.classList.contains("brand") && n.parentNode && n.parentNode.removeChild(n), t.querySelector && t.querySelector(".brand-inline")) || (i = document.createElement("span"), i.className = "brand-inline", i.textContent = "💡Yuzhii", t.appendChild(document.createTextNode(" ")), t.appendChild(i)))
}

function ensureSidebar() {
    function o(n, i, r) {
        var u = document.createElement("a"),
            s, o, e, h;
        return u.className = "nav-link", u.href = n, u.setAttribute("data-nav-id", r), s = document.createElement("span"), s.className = "dot", u.appendChild(s), o = document.createElement("span"), o.setAttribute("data-i18n", i), o.textContent = t(i), u.appendChild(o), e = n, e !== "/" && e.charAt(0) !== "/" && (e = "/" + e), h = e === f || e === "/" && (f === "/" || f === "/index.html"), h && u.classList.add("active"), u
    }
    var i = document.getElementById("sidebar"),
        f, k, s, h, c, d, r, l, g, n, a, v, y, p, e, w, u, b;
    i && i.getAttribute("data-rendered") !== "1" && (i.setAttribute("data-rendered", "1"), f = location && location.pathname ? location.pathname : "", f === "" && (f = "/"), i.innerHTML = "", k = document.createElement("div"), k.className = "sidebar-brand", s = document.createElement("div"), s.className = "title", s.setAttribute("data-i18n", "app.name"), s.textContent = t("app.name"), k.appendChild(s), i.appendChild(k), h = document.createElement("div"), h.className = "sidebar-controls", c = document.createElement("div"), c.className = "control-row", d = document.createElement("div"), d.setAttribute("data-i18n", "control.language"), d.textContent = t("control.language"), c.appendChild(d), r = document.createElement("select"), r.id = "lang_select", r.innerHTML = '<option value="en">English<\/option><option value="zh-cn">简体中文<\/option>', r.value = APP_STATE.lang, r.onchange = function () {
        setLang(r.value)
    }, c.appendChild(r), h.appendChild(c), l = document.createElement("div"), l.className = "control-row", g = document.createElement("div"), g.setAttribute("data-i18n", "control.theme"), g.textContent = t("control.theme"), l.appendChild(g), n = document.createElement("select"), n.id = "theme_select", a = document.createElement("option"), a.value = "auto", a.setAttribute("data-i18n", "theme.auto"), a.textContent = t("theme.auto"), v = document.createElement("option"), v.value = "light", v.setAttribute("data-i18n", "theme.light"), v.textContent = t("theme.light"), y = document.createElement("option"), y.value = "dark", y.setAttribute("data-i18n", "theme.dark"), y.textContent = t("theme.dark"), n.appendChild(a), n.appendChild(v), n.appendChild(y), n.value = APP_STATE.theme, n.onchange = function () {
        setTheme(n.value)
    }, l.appendChild(n), h.appendChild(l), i.appendChild(h), p = document.createElement("div"), p.className = "nav", e = document.createElement("div"), e.className = "nav-section", w = document.createElement("div"), w.className = "nav-section-title", w.setAttribute("data-i18n", "nav.basic"), w.textContent = t("nav.basic"), e.appendChild(w), e.appendChild(o("/", "nav.firmware", "firmware")), e.appendChild(o("/uboot.html", "nav.uboot", "uboot")), p.appendChild(e), u = document.createElement("div"), u.className = "nav-section", b = document.createElement("div"), b.className = "nav-section-title", b.setAttribute("data-i18n", "nav.advanced"), b.textContent = t("nav.advanced"), u.appendChild(b), u.appendChild(o("/bl2.html", "nav.bl2", "bl2")), u.appendChild(o("/gpt.html", "nav.gpt", "gpt")), u.appendChild(o("/initramfs.html", "nav.initramfs", "initramfs")), p.appendChild(u), i.appendChild(p), applyI18n(i))
}

function ajax(n) {
    var t, i;
    t = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    t.upload.addEventListener("progress", function (t) {
        n.progress && n.progress(t)
    });
    t.onreadystatechange = function () {
        t.readyState == 4 && t.status == 200 && n.done && n.done(t.responseText)
    };
    n.timeout && (t.timeout = n.timeout);
    i = "GET";
    n.data && (i = "POST");
    t.open(i, n.url);
    t.send(n.data)
}

function appInit(n) {
    APP_STATE.page = n || "";
    APP_STATE.lang = detectLang();
    APP_STATE.theme = detectTheme();
    setTheme(APP_STATE.theme);
    setLang(APP_STATE.lang);
    ensureSidebar();
    ensureBranding();
    applyI18n(document);
    updateDocumentTitle();
    setTimeout(function () {
        document.body.classList.add("ready")
    }, 0);
    getversion();
    (n === "index" || n === "initramfs") && getmtdlayoutlist()
}

function startup() {
    appInit("index")
}

function getmtdlayoutlist() {
    ajax({
        url: "/getmtdlayout",
        done: function (n) {
            var i, f, e, u, r, o;
            if (n != "error" && (i = n.split(";"), f = document.getElementById("current_mtd_layout"), f && (f.innerHTML = t("label.current_mtd") + i[0]), e = document.getElementById("choose_mtd_layout"), e && (e.textContent = t("label.choose_mtd")), u = document.getElementById("mtd_layout_label"), u)) {
                for (u.options.length = 0, r = 1; r < i.length; r++) i[r].length > 0 && u.options.add(new Option(i[r], i[r]));
                o = document.getElementById("mtd_layout");
                o && (o.style.display = "")
            }
        }
    })
}

function getversion() {
    ajax({
        url: "/version",
        done: function (n) {
            var t = document.getElementById("version");
            t && (t.innerHTML = n);
            ensureBranding()
        }
    })
}

function upload(n) {
    var o = document.getElementById("file").files[0],
        u, f, e, r, i, s;
    o && (u = document.getElementById("form"), u && (u.style.display = "none"), f = document.getElementById("hint"), f && (f.style.display = "none"), e = document.getElementById("bar"), e && (e.style.display = "block"), r = new FormData, r.append(n, o), i = document.getElementById("mtd_layout_label"), i && i.options.length > 0 && (s = i.selectedIndex, r.append("mtd_layout", i.options[s].value)), ajax({
        url: "/upload",
        data: r,
        done: function (n) {
            var i, r, u, f, e;
            n == "fail" ? location = "/fail.html" : (i = n.split(" "), r = document.getElementById("size"), r && (r.style.display = "block", r.innerHTML = t("label.size") + i[0]), u = document.getElementById("md5"), u && (u.style.display = "block", u.innerHTML = t("label.md5") + i[1]), f = document.getElementById("mtd"), f && i[2] && (f.style.display = "block", f.innerHTML = t("label.mtd") + i[2]), e = document.getElementById("upgrade"), e && (e.style.display = "block"))
        },
        progress: function (n) {
            if (n.total) {
                var i = parseInt(n.loaded / n.total * 100),
                    t = document.getElementById("bar");
                t && (t.style.display = "block", t.style.setProperty("--percent", i))
            }
        }
    }))
}
var I18N = {
    en: {
        "app.name": "Recovery Mode WEBUI",
        "nav.basic": "Basic",
        "nav.advanced": "Advanced",
        "nav.firmware": "Firmware update",
        "nav.uboot": "U-Boot update",
        "nav.bl2": "BL2 update",
        "nav.gpt": "GPT update",
        "nav.initramfs": "Load initramfs",
        "control.language": "🌐Language",
        "control.theme": "🌓Theme",
        "theme.auto": "Auto",
        "theme.light": "Light",
        "theme.dark": "Dark",
        "common.upload": "Upload",
        "common.update": "Update",
        "common.boot": "Boot",
        "common.warnings": "WARNINGS",
        "label.size": "Size: ",
        "label.md5": "MD5: ",
        "label.mtd": "MTD layout: ",
        "label.current_mtd": "Current mtd layout: ",
        "label.choose_mtd": "Choose mtd layout:",
        "index.title": "FIRMWARE UPDATE",
        "index.hint": "You are going to update <strong>firmware<\/strong> on the device.<br>Please, choose file from your local hard drive and click <strong>Upload<\/strong> button.",
        "index.upgrade_hint": 'If all information above is correct, click "Update".',
        "index.warn.1": "do not power off the device during update",
        "index.warn.2": "if everything goes well, the device will restart",
        "index.warn.3": "you can upload whatever you want, so be sure that you choose proper firmware image for your device",
        "uboot.title": "U-BOOT UPDATE",
        "uboot.hint": "You are going to update <strong>U-Boot (bootloader)<\/strong> on the device.<br>Please, choose file from your local hard drive and click <strong>Upload<\/strong> button.",
        "uboot.upgrade_hint": 'If all information above is correct, click "Update".',
        "uboot.warn.1": "do not power off the device during update",
        "uboot.warn.2": "if everything goes well, the device will restart",
        "uboot.warn.3": "you can upload whatever you want, so be sure that you choose proper U-Boot image for your device",
        "uboot.warn.4": "updating U-Boot is a very dangerous operation and may damage your device!",
        "bl2.title": "BL2 UPDATE",
        "bl2.hint": "You are going to update <strong>BL2 (preloader)<\/strong> on the device.<br>Please, choose file from your local hard drive and click <strong>Upload<\/strong> button.",
        "bl2.upgrade_hint": 'If all information above is correct, click "Update".',
        "bl2.warn.1": "do not power off the device during update",
        "bl2.warn.2": "if everything goes well, the device will restart",
        "bl2.warn.3": "you can upload whatever you want, so be sure that you choose proper BL2 image for your device",
        "bl2.warn.4": "updating BL2 is a very dangerous operation and may damage your device!",
        "gpt.title": "GPT UPDATE",
        "gpt.hint": "You are going to update <strong>GPT (Partition Table)<\/strong> on the device.<br>Please, choose file from your local hard drive and click <strong>Upload<\/strong> button.",
        "gpt.upgrade_hint": 'If all information above is correct, click "Update".',
        "gpt.warn.1": "do not power off the device during update",
        "gpt.warn.2": "if everything goes well, the device will restart",
        "gpt.warn.3": "you can upload whatever you want, so be sure that you choose proper GPT for your device",
        "gpt.warn.4": "updating GPT is a dangerous operation and may damage your device!",
        "initramfs.title": "LOAD INITRAMFS",
        "initramfs.hint": "You are going to load <strong>initramfs<\/strong> on the device.<br>Please, choose file from your local hard drive and click <strong>Upload<\/strong> button.",
        "initramfs.boot_hint": 'If all information above is correct, click "Boot".',
        "initramfs.warn.1": "if everything goes well, the device will boot into the initramfs",
        "initramfs.warn.2": "you can upload whatever you want, so be sure that you choose proper initramfs image for your device",
        "flashing.title.in_progress": "UPDATE IN PROGRESS",
        "flashing.info.in_progress": "Your file was successfully uploaded! Update is in progress and you should wait for automatic reset of the device.<br>Update time depends on image size and may take up to a few minutes.",
        "flashing.title.done": "UPDATE COMPLETED",
        "flashing.info.done": "Your device was successfully updated! Now rebooting...",
        "booting.title.in_progress": "BOOTING INITRAMFS",
        "booting.info.in_progress": "Your file was successfully uploaded! Booting is in progress, please wait...<br>This page may be in not responding status for a short time.",
        "booting.title.done": "BOOT SUCCESS",
        "booting.info.done": "Your device was successfully booted into initramfs!",
        "fail.title": "UPDATE FAILED",
        "fail.msg.strong": "Something went wrong during update",
        "fail.msg.rest": "Probably you have chosen wrong file. Please, try again or contact with the author of this modification. You can also get more information during update in U-Boot console.",
        "404.title": "PAGE NOT FOUND",
        "404.msg": "The page you were looking for doesn't exist!"
    },
    "zh-cn": {
        "app.name": "恢复模式 WEBUI",
        "nav.basic": "基础功能",
        "nav.advanced": "高级功能",
        "nav.firmware": "固件升级",
        "nav.uboot": "U-Boot 刷写",
        "nav.bl2": "BL2 更新",
        "nav.gpt": "GPT 分区表更新",
        "nav.initramfs": "启动 Initramfs",
        "control.language": "🌐语言",
        "control.theme": "🌓主题",
        "theme.auto": "自动",
        "theme.light": "亮色",
        "theme.dark": "暗色",
        "common.upload": "上传",
        "common.update": "更新",
        "common.boot": "启动",
        "common.warnings": "注意事项",
        "label.size": "大小：",
        "label.md5": "MD5：",
        "label.mtd": "MTD 布局：",
        "label.current_mtd": "当前 mtd 布局：",
        "label.choose_mtd": "选择 mtd 布局：",
        "index.title": "固件升级",
        "index.hint": "你将要在设备上更新 <strong>固件<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong> 按钮。",
        "index.upgrade_hint": "如果以上信息确认无误，请点击“更新”。",
        "index.warn.1": "升级过程中请勿断电",
        "index.warn.2": "如果一切顺利，设备会自动重启",
        "index.warn.3": "你可以上传任意文件，请确保选择了与你的设备匹配的固件镜像",
        "uboot.title": "U-Boot 刷写",
        "uboot.hint": "你将要在设备上更新 <strong>U-Boot（引导程序）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong> 按钮。",
        "uboot.upgrade_hint": "如果以上信息确认无误，请点击“更新”。",
        "uboot.warn.1": "刷写过程中请勿断电",
        "uboot.warn.2": "如果一切顺利，设备会自动重启",
        "uboot.warn.3": "你可以上传任意文件，请确保选择了与你的设备匹配的 U-Boot 镜像",
        "uboot.warn.4": "刷写 U-Boot 风险极高，可能导致设备损坏！",
        "bl2.title": "BL2 更新",
        "bl2.hint": "你将要在设备上更新 <strong>BL2（预加载器）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong> 按钮。",
        "bl2.upgrade_hint": "如果以上信息确认无误，请点击“更新”。",
        "bl2.warn.1": "刷写过程中请勿断电",
        "bl2.warn.2": "如果一切顺利，设备会自动重启",
        "bl2.warn.3": "你可以上传任意文件，请确保选择了与你的设备匹配的 BL2 镜像",
        "bl2.warn.4": "更新 BL2 风险极高，可能导致设备损坏！",
        "gpt.title": "GPT 分区表更新",
        "gpt.hint": "你将要在设备上更新 <strong>GPT（分区表）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong> 按钮。",
        "gpt.upgrade_hint": "如果以上信息确认无误，请点击“更新”。",
        "gpt.warn.1": "刷写过程中请勿断电",
        "gpt.warn.2": "如果一切顺利，设备会自动重启",
        "gpt.warn.3": "你可以上传任意文件，请确保选择了与你的设备匹配的 GPT",
        "gpt.warn.4": "更新 GPT 有风险，可能导致设备损坏！",
        "initramfs.title": "启动 Initramfs",
        "initramfs.hint": "你将要在设备上加载 <strong>initramfs<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong> 按钮。",
        "initramfs.boot_hint": "如果以上信息确认无误，请点击“启动”。",
        "initramfs.warn.1": "如果一切顺利，设备将进入 initramfs",
        "initramfs.warn.2": "你可以上传任意文件，请确保选择了与你的设备匹配的 initramfs 镜像",
        "flashing.title.in_progress": "正在刷写…",
        "flashing.info.in_progress": "文件上传成功！正在执行刷写，请等待设备自动重启。<br>刷写时间取决于镜像大小，可能需要几分钟。",
        "flashing.title.done": "刷写完成",
        "flashing.info.done": "设备已成功更新！即将重启…",
        "booting.title.in_progress": "正在启动 Initramfs…",
        "booting.info.in_progress": "文件上传成功！正在启动，请稍候…<br>该页面短时间可能显示无响应，这是正常现象。",
        "booting.title.done": "启动成功",
        "booting.info.done": "设备已成功进入 initramfs！",
        "fail.title": "更新失败",
        "fail.msg.strong": "更新过程中出现错误",
        "fail.msg.rest": "可能选择了错误的文件。请重试或联系此修改的作者。你也可以在 U-Boot 控制台查看更多刷写过程信息。",
        "404.title": "页面不存在",
        "404.msg": "你访问的页面不存在！"
    }
};
APP_STATE = {
    lang: "en",
    theme: "auto",
    page: ""
}