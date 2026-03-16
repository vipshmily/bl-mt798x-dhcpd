function ajax(n) {
    var t, i;
    t = window.XMLHttpRequest ? new XMLHttpRequest : new ActiveXObject("Microsoft.XMLHTTP");
    t.upload && n && n.progress && t.upload.addEventListener("progress", function (t) {
        n.progress(t)
    });
    t.onreadystatechange = function () {
        if (t.readyState === 4) {
            if (t.status === 200) {
                n && n.done && n.done(t.responseText);
                return
            }
            n && n.fail && n.fail(t)
        }
    };
    n && n.timeout && (t.timeout = n.timeout);
    i = "GET";
    n && n.data && (i = "POST");
    t.open(i, n.url);
    t.send(n.data)
}

function getTheme() {
    var n = null;
    try {
        n = localStorage.getItem("theme")
    } catch (t) { }
    return n === "light" || n === "dark" || n === "auto" ? n : "auto"
}

function applyTheme() {
    var t = getTheme(),
        n;
    document.documentElement.setAttribute("data-theme", t);
    n = document.getElementById("themeSelect");
    n && (n.value = t)
}

function setTheme(n) {
    n !== "light" && n !== "dark" && n !== "auto" && (n = "auto");
    try {
        localStorage.setItem("theme", n)
    } catch (t) { }
    applyTheme()
}

function normalizeLang(n) {
    var t = (n || "").toLowerCase();
    return t.indexOf("zh") === 0 ? "zh-cn" : "en"
}

function getLang() {
    var n = null;
    try {
        n = localStorage.getItem("lang")
    } catch (t) { }
    return n && I18N[n] ? n : normalizeLang(navigator.language || navigator.userLanguage || "en")
}

function setLang(n) {
    I18N[n] || (n = "en");
    try {
        localStorage.setItem("lang", n)
    } catch (i) { }
    applyI18n(document);
    var t = document.getElementById("langSelect");
    t && (t.value = n)
}

function t(n) {
    var i = getLang(),
        t = I18N[i] || I18N.en;
    return t && t[n] || I18N.en && I18N.en[n] || n
}

function applyI18n(n) {
    var v, f, e, o, i, s, y, h, r, c, p, l, u, a, w;
    for (n = n || document, applyTheme(), v = getLang(), f = document.getElementById("langSelect"), f && (f.value = v), e = document.documentElement.getAttribute("data-title-key"), e && (document.title = t(e)), o = n.querySelectorAll("[data-i18n]"), i = 0; i < o.length; i++) s = o[i], y = s.getAttribute("data-i18n"), s.textContent = t(y);
    for (h = n.querySelectorAll("[data-i18n-html]"), r = 0; r < h.length; r++) c = h[r], p = c.getAttribute("data-i18n-html"), c.innerHTML = t(p);
    for (l = n.querySelectorAll("[data-i18n-value]"), u = 0; u < l.length; u++) a = l[u], w = a.getAttribute("data-i18n-value"), a.setAttribute("value", t(w))
}

function initCommonUi() {
    var n, t;
    applyTheme();
    ensureYuzhii();
    n = document.getElementById("themeSelect");
    n && !n.__bound && (n.__bound = !0, n.addEventListener("change", function () {
        setTheme(n.value)
    }));
    t = document.getElementById("langSelect");
    t && !t.__bound && (t.__bound = !0, t.addEventListener("change", function () {
        setLang(t.value)
    }));
    applyI18n(document)
}

function ensureYuzhii() {
    var t = document.getElementById("version"),
        i, n;
    t && ((i = document.getElementById("yuzhii"), i) || (n = document.createElement("div"), n.id = "yuzhii", n.textContent = "💡Yuzhii", n.style.textAlign = "center", n.style.opacity = "0.85", n.style.marginTop = "6px", t.insertAdjacentElement("afterend", n)))
}

function showPanel(n) {
    for (var r, u, t, i, e, o = document.querySelectorAll(".panel"), f = 0; f < o.length; f++) o[f].classList.add("hidden");
    for (r = document.getElementById(n), r && r.classList.remove("hidden"), u = document.querySelectorAll("[data-target]"), t = 0; t < u.length; t++) i = u[t], e = i.getAttribute("data-target") === n, e ? i.classList.add("active") : i.classList.remove("active")
}

function bindNav() {
    for (var t = document.querySelectorAll("[data-target]"), n = 0; n < t.length; n++)(function () {
        var i = t[n];
        i.__bound || (i.__bound = !0, i.addEventListener("click", function (n) {
            var r, t;
            if (i.tagName === "A" && (r = i.getAttribute("href") || "", r.indexOf("#") === 0 && n.preventDefault()), t = i.getAttribute("data-target"), t) {
                showPanel(t);
                try {
                    location.hash = "#" + t
                } catch (u) { }
            }
        }))
    })()
}

function initIndex() {
    var n, t;
    initCommonUi();
    getversion();
    getmtdlayoutlist(document.getElementById("panel-firmware"));
    bindNav();
    n = "panel-firmware";
    location.hash && location.hash.length > 1 && (t = location.hash.substring(1), document.getElementById(t) && (n = t));
    showPanel(n)
}

function initPage() {
    initCommonUi();
    getversion()
}

function startup() {
    initCommonUi();
    getversion();
    getmtdlayoutlist(document)
}

function getversion() {
    ajax({
        url: "/version",
        done: function (n) {
            var t = document.getElementById("version");
            t && (t.textContent = n)
        }
    })
}

function getmtdlayoutlist(n) {
    n = n || document;
    var r = n.querySelector('[data-role="mtd_layout"]') || n.querySelector("#mtd_layout"),
        u = n.querySelector('[data-role="current_mtd_layout"]') || n.querySelector("#current_mtd_layout"),
        i = n.querySelector('[data-role="mtd_layout_label"]') || n.querySelector("#mtd_layout_label");
    r && u && i && ajax({
        url: "/getmtdlayout",
        done: function (n) {
            var f, e;
            if (n !== "error") {
                for (f = n.split(";"), u.textContent = t("mtd.currentPrefix") + f[0], i.options.length = 0, e = 1; e < f.length; e++) f[e] && f[e].length > 0 && i.options.add(new Option(f[e], f[e]));
                r.style.display = ""
            }
        }
    })
}

function findInRoot(n, t, i) {
    if (n) {
        var r = n.querySelector(t);
        if (r) return r
    }
    return i ? document.getElementById(i) : null
}

function upload(n, i) {
    var u = null,
        l, e, a;
    u = typeof i == "string" ? document.getElementById(i) : i && i.nodeType === 1 ? i : document;
    var o = findInRoot(u, '[data-role="file"]', "file"),
        v = findInRoot(u, '[data-role="form"]', "form"),
        y = findInRoot(u, '[data-role="hint"]', "hint"),
        r = findInRoot(u, '[data-role="bar"]', "bar"),
        h = findInRoot(u, '[data-role="size"]', "size"),
        c = findInRoot(u, '[data-role="md5"]', "md5"),
        s = findInRoot(u, '[data-role="mtd"]', "mtd"),
        p = findInRoot(u, '[data-role="upgrade"]', "upgrade"),
        f = findInRoot(u, '[data-role="mtd_layout_label"]', "mtd_layout_label");
    o && o.files && o.files[0] && (l = o.files[0], v && (v.style.display = "none"), y && (y.style.display = "none"), e = new FormData, e.append(n, l), f && f.options && f.options.length > 0 && (a = f.selectedIndex, e.append("mtd_layout", f.options[a].value)), r && (r.style.display = "block", r.style.setProperty("--percent", 0), function () {
        try {
            r.setAttribute("data-percent", "0%")
        } catch (n) { }
        try {
            r.setAttribute("role", "progressbar");
            r.setAttribute("aria-valuemin", "0");
            r.setAttribute("aria-valuemax", "100");
            r.setAttribute("aria-valuenow", "0")
        } catch (n) { }
    }()), ajax({
        url: "/upload",
        data: e,
        done: function (n) {
            if (n === "fail") {
                location = "/fail.html";
                return
            }
            var i = (n || "").split(" "),
                u = i[0] || "",
                f = i[1] || "",
                r = i[2] || "";
            h && (h.style.display = "block", h.textContent = t("label.size") + ": " + u);
            c && (c.style.display = "block", c.textContent = t("label.md5") + ": " + f);
            s && (r ? (s.style.display = "block", s.textContent = t("label.mtd") + ": " + r) : s.style.display = "none");
            p && (p.style.display = "block")
        },
        progress: function (n) {
            if (r && n && n.total) {
                var t = parseInt(n.loaded / n.total * 100, 10);
                t < 0 && (t = 0);
                t > 100 && (t = 100);
                r.style.setProperty("--percent", t);
                try {
                    r.setAttribute("data-percent", t + "%")
                } catch (i) { }
                try {
                    r.setAttribute("role", "progressbar");
                    r.setAttribute("aria-valuemin", "0");
                    r.setAttribute("aria-valuemax", "100");
                    r.setAttribute("aria-valuenow", String(t))
                } catch (i) { }
            }
        }
    }))
}
var I18N = {
    en: {
        "app.title": "Recovery Mode WEBUI",
        "app.subtitle": "Device web updater",
        "lang.label": "🌐Language",
        "theme.label": "🌓Theme",
        "theme.auto": "Auto",
        "theme.light": "Light",
        "theme.dark": "Dark",
        "nav.basic": "Basic",
        "nav.advanced": "Advanced",
        "nav.firmware": "Firmware",
        "nav.uboot": "U-Boot",
        "nav.bl2": "BL2",
        "nav.gpt": "GPT",
        "nav.initramfs": "Initramfs",
        "panel.firmware.title": "Firmware update",
        "panel.uboot.title": "U-Boot update",
        "panel.bl2.title": "BL2 update",
        "panel.gpt.title": "GPT update",
        "panel.initramfs.title": "Load initramfs",
        "panel.firmware.hint": "You are going to update <strong>firmware<\/strong> on the device.<br>Please choose a file from your computer and click <strong>Upload<\/strong>.",
        "panel.uboot.hint": "You are going to update <strong>U-Boot (bootloader)<\/strong> on the device.<br>Please choose a file from your computer and click <strong>Upload<\/strong>.",
        "panel.bl2.hint": "You are going to update <strong>BL2 (preloader)<\/strong> on the device.<br>Please choose a file from your computer and click <strong>Upload<\/strong>.",
        "panel.gpt.hint": "You are going to update <strong>GPT (Partition Table)<\/strong> on the device.<br>Please choose a file from your computer and click <strong>Upload<\/strong>.",
        "panel.initramfs.hint": "You are going to load <strong>initramfs<\/strong> on the device.<br>Please choose a file from your computer and click <strong>Upload<\/strong>.",
        "mtd.choose": "Choose MTD layout",
        "mtd.currentPrefix": "Current MTD layout: ",
        "label.size": "Size",
        "label.md5": "MD5",
        "label.mtd": "MTD layout",
        "btn.upload": "Upload",
        "btn.update": "Update",
        "btn.boot": "Boot",
        "confirm.update": "If all information above is correct, click “Update”.",
        "confirm.boot": "If all information above is correct, click “Boot”.",
        "warn.title": "Warnings",
        "warn.noPowerOff": "Do not power off the device during update",
        "warn.restart": "If everything goes well, the device will restart",
        "warn.chooseProperFirmware": "You can upload whatever you want, so be sure you choose the proper firmware image for your device",
        "warn.chooseProperUboot": "You can upload whatever you want, so be sure you choose the proper U-Boot image for your device",
        "warn.chooseProperBl2": "You can upload whatever you want, so be sure you choose the proper BL2 image for your device",
        "warn.chooseProperGpt": "You can upload whatever you want, so be sure you choose the proper GPT for your device",
        "warn.ubootDanger": "Updating U-Boot is a very dangerous operation and may damage your device!",
        "warn.bl2Danger": "Updating BL2 is a very dangerous operation and may damage your device!",
        "warn.gptDanger": "Updating GPT is a dangerous operation and may damage your device!",
        "warn.initramfsBoot": "If everything goes well, the device will boot into the initramfs",
        "warn.chooseProperInitramfs": "You can upload whatever you want, so be sure you choose the proper initramfs image for your device",
        "page.flashing.title": "Update in progress",
        "page.flashing.h1": "Update in progress",
        "page.flashing.info": "Your file was successfully uploaded! Update is in progress and you should wait for automatic reset of the device.<br>Update time depends on image size and may take up to a few minutes.",
        "page.flashing.doneH1": "Update completed",
        "page.flashing.doneInfo": "Your device was successfully updated! Now rebooting...",
        "page.booting.title": "Booting initramfs",
        "page.booting.h1": "Booting initramfs",
        "page.booting.info": "Your file was successfully uploaded! Booting is in progress, please wait...<br>This page may be unresponsive for a short time.",
        "page.booting.doneH1": "Boot success",
        "page.booting.doneInfo": "Your device was successfully booted into initramfs!",
        "page.fail.title": "Update failed",
        "page.fail.h1": "Update failed",
        "page.fail.msgStrong": "Something went wrong during update",
        "page.fail.msg": "Probably you have chosen a wrong file. Please try again or contact the author of this modification. You can also get more information during update in U-Boot console.",
        "page.404.title": "Page not found",
        "page.404.h1": "Page not found",
        "page.404.msg": "The page you were looking for doesn't exist!"
    },
    "zh-cn": {
        "app.title": "恢复模式 WEBUI",
        "app.subtitle": "设备 Web 更新工具",
        "lang.label": "🌐语言",
        "theme.label": "🌓主题",
        "theme.auto": "自动",
        "theme.light": "浅色",
        "theme.dark": "深色",
        "nav.basic": "基础功能",
        "nav.advanced": "高级功能",
        "nav.firmware": "固件升级",
        "nav.uboot": "U-Boot 升级",
        "nav.bl2": "BL2 升级",
        "nav.gpt": "GPT 升级",
        "nav.initramfs": "Initramfs 启动",
        "panel.firmware.title": "固件升级",
        "panel.uboot.title": "U-Boot 升级",
        "panel.bl2.title": "BL2 升级",
        "panel.gpt.title": "GPT 升级",
        "panel.initramfs.title": "加载 Initramfs",
        "panel.firmware.hint": "你将要在设备上升级 <strong>固件<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong>。",
        "panel.uboot.hint": "你将要在设备上升级 <strong>U-Boot（引导程序）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong>。",
        "panel.bl2.hint": "你将要在设备上升级 <strong>BL2（预加载）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong>。",
        "panel.gpt.hint": "你将要在设备上升级 <strong>GPT（分区表）<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong>。",
        "panel.initramfs.hint": "你将要在设备上启动 <strong>initramfs<\/strong>。<br>请选择本地文件并点击 <strong>上传<\/strong>。",
        "mtd.choose": "选择 MTD 布局",
        "mtd.currentPrefix": "当前 MTD 布局：",
        "label.size": "大小",
        "label.md5": "MD5",
        "label.mtd": "MTD 布局",
        "btn.upload": "上传",
        "btn.update": "更新",
        "btn.boot": "启动",
        "confirm.update": "如果以上信息无误，请点击“更新”。",
        "confirm.boot": "如果以上信息无误，请点击“启动”。",
        "warn.title": "注意事项",
        "warn.noPowerOff": "更新过程中请勿断电",
        "warn.restart": "更新成功后设备会自动重启",
        "warn.chooseProperFirmware": "你可以上传任意文件，请确保选择了适用于设备的正确固件镜像",
        "warn.chooseProperUboot": "你可以上传任意文件，请确保选择了适用于设备的正确 U-Boot 镜像",
        "warn.chooseProperBl2": "你可以上传任意文件，请确保选择了适用于设备的正确 BL2 镜像",
        "warn.chooseProperGpt": "你可以上传任意文件，请确保选择了适用于设备的正确 GPT",
        "warn.ubootDanger": "更新 U-Boot 风险极高，可能会损坏设备！",
        "warn.bl2Danger": "更新 BL2 风险极高，可能会损坏设备！",
        "warn.gptDanger": "更新 GPT 存在风险，可能会损坏设备！",
        "warn.initramfsBoot": "若一切正常，设备将启动进入 initramfs",
        "warn.chooseProperInitramfs": "你可以上传任意文件，请确保选择了适用于设备的正确 initramfs 镜像",
        "page.flashing.title": "正在更新",
        "page.flashing.h1": "正在更新",
        "page.flashing.info": "文件已成功上传！正在执行更新，请等待设备自动重启。<br>更新时间取决于镜像大小，可能需要几分钟。",
        "page.flashing.doneH1": "更新完成",
        "page.flashing.doneInfo": "设备已成功更新！正在重启…",
        "page.booting.title": "正在启动 Initramfs",
        "page.booting.h1": "正在启动 Initramfs",
        "page.booting.info": "文件已成功上传！正在启动，请稍候…<br>此页面可能会短暂无响应。",
        "page.booting.doneH1": "启动成功",
        "page.booting.doneInfo": "设备已成功启动进入 initramfs！",
        "page.fail.title": "更新失败",
        "page.fail.h1": "更新失败",
        "page.fail.msgStrong": "更新过程中发生错误",
        "page.fail.msg": "可能选择了错误的文件。请重试或联系此修改的作者。你也可以在 U-Boot 控制台中获取更多信息。",
        "page.404.title": "页面不存在",
        "page.404.h1": "页面不存在",
        "page.404.msg": "你访问的页面不存在！"
    }
}