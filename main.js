/* SkillLoop 落地页 — 交互层 */
(function () {
  "use strict";

  var API_BASE = "https://api.skillloop.cc";

  /* ---- API helper (standalone, no App.js dependency) ---- */
  function apiPost(url, body) {
    return fetch(API_BASE + url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).then(function (r) {
      if (!r.ok) return r.json().then(function (e) { throw new Error(e.detail || "请求失败"); });
      return r.json();
    });
  }

  /* ---- Word cycling ---- */
  (function () {
    var el = document.getElementById("cyclingWord");
    if (!el) return;
    var words = ["服务器", "屏幕", "代码", "机房"];
    var idx = 0, swapping = false;
    function swap() {
      if (swapping) return;
      swapping = true;
      el.style.opacity = "0";
      el.style.transform = "translateY(12px)";
      setTimeout(function () {
        idx = (idx + 1) % words.length;
        el.textContent = words[idx];
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        swapping = false;
      }, 400);
    }
    setInterval(swap, 2800);
  })();

  /* ---- Cursor glow ---- */
  (function () {
    var glow = document.getElementById("cursorGlow");
    if (!glow) return;
    var hero = document.getElementById("hero");
    var ticking = false;
    document.addEventListener("mousemove", function (e) {
      if (!ticking) {
        requestAnimationFrame(function () {
          glow.style.left = e.clientX + "px";
          glow.style.top = e.clientY + "px";
          ticking = false;
        });
        ticking = true;
      }
      var heroRect = hero ? hero.getBoundingClientRect() : null;
      glow.classList.toggle("active", heroRect && e.clientY < heroRect.bottom);
    });
  })();

  /* ---- Particles ---- */
  (function () {
    var canvas = document.getElementById("particles-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var particles = [], w, h;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    for (var i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 0.3,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.35 + 0.05,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(129,140,248," + p.alpha + ")";
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = w;
        if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        if (p.y > h) p.y = 0;
      }
      requestAnimationFrame(draw);
    }
    draw();
  })();

  /* ---- Activity Ticker ---- */
  function initTicker() {
    var track = document.getElementById("tickerTrack");
    if (!track) return;

    var fallback = [
      { name: "张**", city: "北京", skill: "摄影摄像" },
      { name: "李翻译", city: "上海", skill: "翻译陪同" },
      { name: "王**", city: "广州", skill: "商务支持" },
      { name: "陈老师", city: "成都", skill: "教课咨询" },
      { name: "刘**", city: "深圳", skill: "编程开发" },
      { name: "赵**", city: "杭州", skill: "出行代驾" },
      { name: "周**", city: "潍坊", skill: "跑腿代办" },
      { name: "吴**", city: "武汉", skill: "生活服务" },
    ];

    function build(items) {
      var doubled = items.concat(items);
      doubled.forEach(function (a) {
        var span = document.createElement("span");
        span.className = "ticker-item";
        span.innerHTML =
          "📍 " + a.city + " · " + a.name + " 刚刚注册了「" + a.skill + "」<span class='ticker-dot'> · </span>";
        track.appendChild(span);
      });
    }

    fetch(API_BASE + "/api/v1/landing/recent-activity")
      .then(function (r) { return r.json(); })
      .then(function (data) { build(data && data.length ? data : fallback); })
      .catch(function () { build(fallback); });
  }

  /* ---- Stats counter ---- */
  function loadStats() {
    animateCounter("statTaskers", 1286);
    animateCounter("statTasks", 3420);
    animateCounter("statCities", 12);
  }

  function animateCounter(id, end) {
    var el = document.getElementById(id);
    if (!el) return;
    var start = 0, duration = 2200, startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(start + (end - start) * eased).toLocaleString();
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  /* ---- Tab toggle ---- */
  document.querySelectorAll(".tab-btn").forEach(function (btn) {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });
      document.querySelectorAll(".tab-panel").forEach(function (p) { p.classList.remove("active"); });
      btn.classList.add("active");
      var panel = document.getElementById("tab-" + btn.getAttribute("data-tab"));
      if (panel) panel.classList.add("active");
    });
  });

  /* ---- Skill chip selection ---- */
  document.querySelectorAll("#skillSelect .skill-chip").forEach(function (chip) {
    chip.addEventListener("click", function () { chip.classList.toggle("selected"); });
  });

  /* ---- City datalist ---- */
  var cities = [
    "北京","上海","广州","深圳","成都","杭州","武汉","南京","天津","重庆",
    "西安","长沙","青岛","大连","厦门","苏州","宁波","无锡","郑州","济南",
    "福州","合肥","昆明","哈尔滨","长春","沈阳","石家庄","太原","南宁","贵阳",
    "兰州","乌鲁木齐","呼和浩特","银川","西宁","拉萨","南昌","海口","三亚",
    "东莞","佛山","珠海","惠州","中山","烟台","威海","洛阳","宜昌","襄阳",
    "潍坊","淄博","临沂","南通","常州","徐州","温州","金华","泉州","漳州"
  ];
  var cityDatalist = document.getElementById("cityList");
  if (cityDatalist) {
    cities.forEach(function (c) {
      var o = document.createElement("option");
      o.value = c;
      cityDatalist.appendChild(o);
    });
  }

  /* ---- Wizard ---- */
  var selectedSkills = [];

  function showStep(n) {
    document.querySelectorAll(".wizard-panel").forEach(function (p) { p.classList.remove("active"); });
    var panel = document.getElementById("wpanel-" + n);
    if (panel) panel.classList.add("active");
    document.querySelectorAll(".wizard-step").forEach(function (s) {
      var sn = parseInt(s.getAttribute("data-wstep"));
      s.classList.remove("active", "done");
      if (sn === n) s.classList.add("active");
      else if (sn < n) s.classList.add("done");
    });
  }

  window.goToStep2 = function () {
    var phone = document.getElementById("phone").value.trim();
    var code = document.getElementById("smsCode").value.trim();
    var err = document.getElementById("step1Error");
    if (!/^1[3-9]\d{9}$/.test(phone)) { err.textContent = "请输入正确的手机号"; return; }
    if (code.length !== 6 || !/^\d{6}$/.test(code)) { err.textContent = "请输入6位验证码"; return; }
    err.textContent = "";
    showStep(2);
  };

  window.goToStep1 = function () {
    document.getElementById("step2Error").textContent = "";
    showStep(1);
  };

  window.goToStep3 = function () {
    var selected = document.querySelectorAll("#skillSelect .skill-chip.selected");
    var skills = [];
    selected.forEach(function (c) { skills.push(c.getAttribute("data-skill")); });
    var custom = document.getElementById("customSkill").value.trim();
    if (custom) skills.push(custom);
    var err = document.getElementById("step2Error");
    if (skills.length === 0) { err.textContent = "请至少选择一项技能"; return; }
    err.textContent = "";
    selectedSkills = skills;
    showStep(3);
  };

  /* ---- SMS countdown ---- */
  var smsCooldown = 0, smsInterval = null;
  function updateSmsBtn() {
    var btn = document.getElementById("sendSmsBtn");
    if (!btn) return;
    btn.disabled = smsCooldown > 0;
    btn.textContent = smsCooldown > 0 ? smsCooldown + "s 后重发" : "发送验证码";
  }

  window.handleSendSms = function () {
    var phone = document.getElementById("phone").value.trim();
    var err = document.getElementById("step1Error");
    if (!/^1[3-9]\d{9}$/.test(phone)) { err.textContent = "请输入正确的手机号"; return; }
    if (smsCooldown > 0) return;
    err.textContent = "";
    apiPost("/api/v1/auth/send-sms", { phone: phone })
      .then(function () {
        smsCooldown = 60;
        updateSmsBtn();
        smsInterval = setInterval(function () {
          smsCooldown--;
          updateSmsBtn();
          if (smsCooldown <= 0) clearInterval(smsInterval);
        }, 1000);
      })
      .catch(function () {
        // Demo mode: simulate SMS sent
        smsCooldown = 60;
        updateSmsBtn();
        smsInterval = setInterval(function () {
          smsCooldown--;
          updateSmsBtn();
          if (smsCooldown <= 0) clearInterval(smsInterval);
        }, 1000);
      });
  };

  /* ---- Submit registration ---- */
  window.handleSubmit = function () {
    var phone = document.getElementById("phone").value.trim();
    var code = document.getElementById("smsCode").value.trim();
    var city = document.getElementById("city").value.trim();
    var err = document.getElementById("step3Error");
    var btn = document.getElementById("submitBtn");
    if (!city) { err.textContent = "请输入城市"; return; }
    err.textContent = "";
    btn.disabled = true;
    btn.textContent = "注册中…";

    apiPost("/api/v1/auth/web-register", {
      phone: phone,
      code: code,
      skills: selectedSkills,
      city: city,
    })
      .then(function (data) {
        document.getElementById("initPassword").textContent = data.password || "--------";
        showStep("success");
      })
      .catch(function () {
        // Demo mode: simulate success
        document.getElementById("initPassword").textContent = "demo" + Math.random().toString(36).slice(2, 10);
        showStep("success");
      });
  };

  /* ---- Nav scroll effect ---- */
  (function () {
    var nav = document.getElementById("topNav");
    if (!nav) return;
    window.addEventListener("scroll", function () {
      nav.classList.toggle("scrolled", window.scrollY > 60);
    });
  })();

  /* ---- Scroll reveal ---- */
  (function () {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    document.querySelectorAll(".reveal, .reveal-stagger").forEach(function (el) {
      observer.observe(el);
    });
  })();

  /* ---- Smooth scroll for nav links ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      var id = this.getAttribute("href").substring(1);
      var el = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---- Start ---- */
  initTicker();
  loadStats();
})();
