/* 凡哥的投资指南 — 渲染逻辑 */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var esc = function (s) { return String(s); };

  /* ---------- 主题 ---------- */
  var theme = localStorage.getItem("fg-theme") || "light";
  document.documentElement.setAttribute("data-theme", theme);
  $("#themeBtn").onclick = function () {
    theme = theme === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("fg-theme", theme);
  };

  /* ---------- Tab ---------- */
  Array.prototype.forEach.call(document.querySelectorAll(".tabbar button"), function (b) {
    b.onclick = function () {
      Array.prototype.forEach.call(document.querySelectorAll(".tabbar button"), function (x) { x.classList.remove("on"); });
      b.classList.add("on");
      Array.prototype.forEach.call(document.querySelectorAll(".page"), function (p) { p.classList.remove("active"); });
      $("#page-" + b.dataset.page).classList.add("active");
      window.scrollTo(0, 0);
    };
  });

  /* ---------- 顶部 ---------- */
  $("#subtitle").textContent = "更新 " + MARKET.updated + " · 数据截至 " + MARKET.dataAsOf;

  /* ---------- 宏观仪表盘 ---------- */
  $("#macro-grid").innerHTML = MARKET.macro.map(function (m) {
    var cls = m.dir === "up" ? "up" : (m.dir === "down" ? "down" : "flat");
    return '<div class="metric"><div class="m-label">' + esc(m.label) + '</div>' +
      '<div class="m-value ' + cls + '">' + esc(m.value) + '</div>' +
      '<div class="m-sub">' + esc(m.sub) + '</div></div>';
  }).join("");

  /* ---------- 首页三标的信号灯 ---------- */
  var sigCls = { green: "s-green", yellow: "s-yellow", red: "s-red", blue: "s-blue" };
  $("#home-signal").innerHTML = Object.keys(MARKET.assets).map(function (k) {
    var a = MARKET.assets[k];
    var dirCls = a.dir === "up" ? "up" : (a.dir === "down" ? "down" : "flat");
    return '<div class="card asset-card" data-k="' + k + '">' +
      '<div class="asset-head"><div><span class="asset-name">' + esc(a.name) + '</span>' +
      '<span class="asset-code">' + esc(a.code) + '</span></div>' +
      '<div class="asset-price"><div class="p">' + esc(a.price) + '</div>' +
      '<div class="c ' + dirCls + '">' + esc(a.change) + '</div></div></div>' +
      '<span class="signal ' + sigCls[a.signal.level] + '"><i class="dot"></i>' + esc(a.signal.text) + '</span>' +
      '<div class="verdict">' + esc(a.verdict) + '</div>' +
      '<div class="bar-wrap"><div class="bar-label"><span>' + esc(a.valuation.label) + '</span>' +
      '<span>' + esc(a.valuation.display) + '</span></div>' +
      '<div class="bar"><i style="width:' + a.valuation.value + '%"></i></div>' +
      '<div style="font-size:11px;color:var(--text-3);margin-top:4px">' + esc(a.valuation.note) + '</div></div>' +
      '</div>';
  }).join("");

  /* ---------- 今日观察 ---------- */
  (function () {
    var d = MARKET.days[0];
    var html = '<div class="card"><div style="font-size:15px;font-weight:700;margin-bottom:4px">' + esc(d.title) + '</div>' +
      '<div style="font-size:11px;color:var(--text-3);margin-bottom:10px">' + esc(d.date) + '</div>' +
      '<div class="sec-title" style="margin:6px 0">利好</div><ul class="list good">' +
      d.good.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
      '<div class="sec-title" style="margin:14px 0 6px">利空</div><ul class="list bad">' +
      d.bad.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>' +
      '</div>' +
      '<div class="card" style="border-left:3px solid var(--brand)">' +
      '<div style="font-size:12px;font-weight:700;color:var(--brand);margin-bottom:6px">今天的判断</div>' +
      '<div style="font-size:13.5px;line-height:1.7">' + esc(d.takeaway) + '</div></div>';
    $("#today-box").innerHTML = html;
    $("#action-box").innerHTML = '<ul class="list neutral">' +
      d.action.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>';
  })();

  /* ---------- 标的详情 ---------- */
  $("#asset-list").innerHTML = Object.keys(ASSETS).map(function (k) {
    var a = ASSETS[k];
    return '<details class="acc"' + (k === "nasdaq" ? " open" : "") + '>' +
      '<summary>' + esc(a.name) + '<span style="font-size:11px;font-weight:400;color:var(--text-3)">' + esc(a.sub) + '</span></summary>' +
      '<div class="body">' +
      '<div class="fan">' +
      '<div class="fan-layer"><div class="fl-t">政策面</div><div class="fl-c">' + esc(a.fan.policy) + '</div></div>' +
      '<div class="fan-layer"><div class="fl-t">宏观面</div><div class="fl-c">' + esc(a.fan.macro) + '</div></div>' +
      '<div class="fan-layer"><div class="fl-t">基本面</div><div class="fl-c">' + esc(a.fan.basic) + '</div></div>' +
      '</div>' +
      '<div class="sec-title" style="margin:16px 0 4px">要点拆解</div>' +
      a.points.map(function (p) {
        return '<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(p.t) + '</div>' +
          '<div style="font-size:13px;margin-top:2px">' + esc(p.d) + '</div></div>';
      }).join("") +
      '<div class="sec-title" style="margin:16px 0 4px">关键读数</div>' +
      '<table class="tbl">' + a.watch.map(function (w) {
        return "<tr><td>" + esc(w[0]) + "</td><td class='num'>" + esc(w[1]) + "</td></tr>";
      }).join("") + '</table>' +
      '<div class="sec-title" style="margin:16px 0 4px">定投纪律</div>' +
      '<table class="tbl">' +
      "<tr><td>目标仓位</td><td class='num'>" + esc(a.plan.ratio) + "</td></tr>" +
      "<tr><td>渠道</td><td class='num' style='text-align:right'>" + esc(a.plan.channel) + "</td></tr>" +
      "<tr><td>节奏</td><td class='num'>" + esc(a.plan.freq) + "</td></tr>" +
      "</table>" +
      '<div class="note" style="margin-top:8px;border-color:var(--brand)">' + esc(a.plan.rule) + '</div>' +
      '<div class="sec-title" style="margin:16px 0 4px">风险</div>' +
      '<ul class="list bad">' + a.risks.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + '</ul>' +
      '</div></details>';
  }).join("");

  /* ---------- 配置甜甜圈 ---------- */
  (function () {
    var items = ALLOC.items, total = 0, off = 0, R = 48, C = 2 * Math.PI * R;
    items.forEach(function (i) { total += i.pct; });
    var segs = items.map(function (i) {
      var len = (i.pct / total) * C;
      var s = '<circle cx="60" cy="60" r="' + R + '" fill="none" stroke="' + i.color + '" stroke-width="22" ' +
        'stroke-dasharray="' + len.toFixed(2) + ' ' + (C - len).toFixed(2) + '" stroke-dashoffset="' + (-off).toFixed(2) + '" transform="rotate(-90 60 60)"></circle>';
      off += len;
      return s;
    }).join("");
    var svg = '<svg viewBox="0 0 120 120" style="width:120px;height:120px;flex:none">' + segs +
      '<text x="60" y="57" text-anchor="middle" font-size="26" font-weight="800" fill="currentColor">50</text>' +
      '<text x="60" y="72" text-anchor="middle" font-size="11" fill="currentColor" opacity=".6">核心 %</text></svg>';
    $("#alloc-box").innerHTML =
      '<div style="font-size:14px;font-weight:700;margin-bottom:2px">' + esc(ALLOC.title) + '</div>' +
      '<div style="font-size:13px;margin-bottom:12px">' + esc(ALLOC.desc) + '</div>' +
      '<div style="display:flex;gap:14px;align-items:center">' + svg +
      '<div style="flex:1">' + items.map(function (i) {
        return '<div style="display:flex;align-items:center;gap:7px;margin-bottom:7px">' +
          '<i style="width:9px;height:9px;border-radius:2px;background:' + i.color + ';flex:none"></i>' +
          '<div style="flex:1;font-size:12.5px">' + esc(i.name) + '<div style="font-size:10.5px;color:var(--text-3)">' + esc(i.role) + '</div></div>' +
          '<b style="font-size:14px">' + i.pct + '%</b></div>';
      }).join("") + '</div></div>' +
      '<ul class="list neutral" style="margin-top:12px">' + ALLOC.rules.map(function (r) { return "<li>" + esc(r) + "</li>"; }).join("") + '</ul>';
  })();

  /* ---------- 常见坑 ---------- */
  $("#pitfall-box").innerHTML = PITFALLS.map(function (p) {
    return '<div style="padding:8px 0;border-bottom:1px dashed var(--line)">' +
      '<div style="font-size:13.5px;font-weight:600">⚠ ' + esc(p.t) + '</div>' +
      '<div style="font-size:12.5px;color:var(--text-2);margin-top:2px">' + esc(p.d) + '</div></div>';
  }).join("");

  /* ---------- 方法论 ---------- */
  var F = FRAMEWORK;
  $("#fw-gears").innerHTML = '<div class="card"><div style="font-size:14.5px;font-weight:700">' + esc(F.gears.title) + '</div>' +
    '<div style="font-size:13px;margin:6px 0 12px">' + esc(F.gears.desc) + '</div>' +
    '<div class="grid g3">' + F.gears.items.map(function (i) {
      return '<div style="background:var(--card-2);border:1px solid var(--line);border-radius:11px;padding:10px;text-align:center">' +
        '<div style="font-size:20px;font-weight:800;color:var(--brand)">' + i.n + '</div>' +
        '<div style="font-size:12.5px;font-weight:700;margin-top:2px">' + esc(i.t) + '</div>' +
        '<div style="font-size:11.5px;color:var(--text-3);margin-top:3px">' + esc(i.d) + '</div></div>';
    }).join("") + '</div>' +
    '<div class="note" style="margin-top:12px">' + esc(F.gears.caution) + '</div></div>';

  $("#fw-quadrants").innerHTML = '<div style="font-size:14.5px;font-weight:700">' + esc(F.quadrants.title) + '</div>' +
    '<div style="margin-top:8px">' + F.quadrants.items.map(function (i, n) {
      return '<div style="display:flex;gap:9px;margin-bottom:9px"><span class="pill">' + (n + 1) + '</span>' +
        '<div><div style="font-size:13px;font-weight:600">' + esc(i.t) + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-2)">' + esc(i.d) + '</div></div></div>';
    }).join("") + '</div>';

  $("#fw-fan").innerHTML = '<div style="font-size:14.5px;font-weight:700">' + esc(F.fan.title) + '</div>' +
    '<div style="font-size:13px;margin:6px 0 12px">' + esc(F.fan.desc) + '</div>' +
    '<div class="fan">' + F.fan.layers.map(function (l) {
      return '<div class="fan-layer"><div class="fl-t">' + esc(l.t) + '</div><div class="fl-c">' + esc(l.d) + '</div>' +
        '<div style="font-size:12px;color:var(--brand);margin-top:5px">→ ' + esc(l.cn) + '</div></div>';
    }).join("") + '</div>';

  var fillAcc = function (id, title, html) {
    var el = $(id);
    el.innerHTML = '<summary>' + esc(title) + '</summary><div class="body">' + html + '</div>';
  };

  fillAcc("#fw-industry", F.industry.title,
    F.industry.items.map(function (i) {
      return '<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(i.t) + '</div>' +
        '<div style="font-size:13px;margin-top:2px">' + esc(i.d) + '</div></div>';
    }).join(""));

  fillAcc("#fw-fund", F.fund.title,
    F.fund.factors.map(function (f) {
      return '<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(f.t) + '</div>' +
        '<div style="font-size:13px;margin-top:2px">' + esc(f.d) + '</div></div>';
    }).join("") +
    '<div class="sec-title" style="margin:14px 0 4px">三步法</div><ul class="list neutral">' +
    F.fund.steps.map(function (s) { return "<li>" + esc(s) + "</li>"; }).join("") + '</ul>' +
    '<div class="note" style="margin-top:10px">' + esc(F.fund.iron) + '</div>');

  fillAcc("#fw-report", F.report.title,
    '<div class="sec-title" style="margin:4px 0">五大内容</div><ul class="list neutral">' +
    F.report.contents.map(function (c) { return "<li>" + esc(c) + "</li>"; }).join("") + '</ul>' +
    '<div class="sec-title" style="margin:14px 0 4px">三维度速读</div>' +
    F.report.dims.map(function (d) {
      return '<div style="margin-bottom:10px"><div style="font-size:13px;font-weight:600;color:var(--text)">' + esc(d.t) + '</div>' +
        '<div style="font-size:13px;margin-top:2px">' + esc(d.d) + '</div></div>';
    }).join(""));

  $("#fw-gold").innerHTML = '<div style="font-size:14.5px;font-weight:700">' + esc(F.gold.title) + '</div>' +
    '<table class="tbl"><tr><th>需求</th><th>占比</th><th>是否主导</th></tr>' +
    F.gold.items.map(function (i) {
      return '<tr><td><b style="font-size:12.5px">' + esc(i.t) + '</b><div style="font-size:11.5px;color:var(--text-2)">' + esc(i.d) + '</div></td>' +
        '<td style="white-space:nowrap">' + esc(i.p) + '</td>' +
        '<td>' + (i.main ? '<span style="color:var(--up);font-weight:700">主导</span>' : '<span style="color:var(--text-3)">—</span>') + '</td></tr>';
    }).join("") + '</table>' +
    '<div class="note" style="margin-top:10px">' + esc(F.gold.rule) + '</div>';

  /* ---------- 公司打分表 ---------- */
  (function () {
    var scores = [0, 0, 0, 0, 0, 0];
    var el = $("#fw-score");
    el.innerHTML = '<summary>' + esc(F.company.title) + '</summary><div class="body">' +
      '<div style="font-size:13px;margin-bottom:10px">' + esc(F.company.desc) + '</div>' +
      '<div id="score-rows"></div>' +
      '<div class="score-total"><span class="big" id="score-num">—</span><span id="score-txt">给每项打分（1–5 分）</span></div>' +
      '<div class="note" style="margin-top:10px">用法：每维度两项相加得该维度分（0–10），三维度取平均。<b>低于 8 分 = 无投资价值，直接跳过。</b></div>' +
      '</div>';

    function render() {
      $("#score-rows").innerHTML = F.company.dims.map(function (d, i) {
        var btns = "";
        for (var v = 1; v <= 5; v++) {
          btns += '<button data-i="' + i + '" data-v="' + v + '" class="' + (scores[i] === v ? "on" : "") + '">' + v + '</button>';
        }
        return '<div class="score-row"><div class="sr-name">' + esc(d.g) + ' · ' + esc(d.a) +
          '<small>' + esc(d.hint) + '</small></div><div class="stars">' + btns + '</div></div>';
      }).join("");
      Array.prototype.forEach.call(document.querySelectorAll("#score-rows .stars button"), function (b) {
        b.onclick = function () {
          var i = +b.dataset.i, v = +b.dataset.v;
          scores[i] = (scores[i] === v) ? 0 : v;
          render();
        };
      });
      var dims = [scores[0] + scores[1], scores[2] + scores[3], scores[4] + scores[5]];
      var done = scores.every(function (s) { return s > 0; });
      if (!done) {
        $("#score-num").textContent = "—";
        $("#score-txt").textContent = "还有 " + scores.filter(function (s) { return !s; }).length + " 项未打分";
        return;
      }
      var avg = (dims[0] + dims[1] + dims[2]) / 3;
      $("#score-num").textContent = avg.toFixed(1);
      $("#score-txt").textContent = avg >= 8 ? "✅ 达到 8 分线，值得继续深挖" : "❌ 低于 8 分，无投资价值";
    }
    render();
  })();

  /* ---------- 2026 框架修正 ---------- */
  $("#fw-revision").innerHTML = '<div class="card" style="border-left:3px solid var(--up)">' +
    '<div style="font-size:14.5px;font-weight:700">' + esc(F.revision.title) + '</div>' +
    '<div style="font-size:13px;margin:6px 0 12px">' + esc(F.revision.desc) + '</div>' +
    F.revision.items.map(function (i) {
      return '<div style="background:var(--card-2);border:1px solid var(--line);border-radius:11px;padding:10px;margin-bottom:9px">' +
        '<div style="font-size:12px;color:var(--text-3);text-decoration:line-through">' + esc(i.old) + '</div>' +
        '<div style="font-size:13px;font-weight:600;margin:4px 0;color:var(--up)">→ ' + esc(i.now) + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-2)">' + esc(i.keep) + '</div></div>';
    }).join("") +
    '<div class="note">' + esc(F.revision.lesson) + '</div></div>';

  $("#fw-discipline").innerHTML = '<ul class="list neutral">' +
    F.discipline.items.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + '</ul>';

  /* ---------- 日志 ---------- */
  $("#jv").textContent = "当前 " + JOURNAL.current;
  $("#journal-box").innerHTML = '<div class="tl">' + JOURNAL.journal.map(function (j) {
    return '<div class="tl-item"><div><span class="tl-date">' + esc(j.date) + '</span>' +
      '<span class="tl-ver">' + esc(j.v) + '</span></div>' +
      '<div class="tl-title">' + esc(j.title) + '</div>' +
      '<div class="tl-body">' + esc(j.body) + '</div>' +
      '<div style="margin-top:8px">' + j.changed.map(function (c) { return '<span class="pill">+ ' + esc(c) + '</span>'; }).join("") + '</div></div>';
  }).join("") + '</div>';

  $("#hyp-box").innerHTML += JOURNAL.hypotheses.map(function (h) {
    return '<div class="card tight" style="margin-top:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">' +
      '<span class="pill" style="background:var(--brand-soft);color:var(--brand);border-color:var(--brand)">' + esc(h.id) + '</span>' +
      '<span style="font-size:11px;color:var(--text-3)">检验日 ' + esc(h.check) + ' · ' + esc(h.status) + '</span></div>' +
      '<div style="font-size:13.5px;font-weight:600;margin:6px 0">' + esc(h.content) + '</div>' +
      '<div style="font-size:12.5px;color:var(--text-2)"><b>依据：</b>' + esc(h.why) + '</div>' +
      '<div style="font-size:12.5px;color:var(--text-2);margin-top:4px"><b>证伪条件：</b>' + esc(h.falsify) + '</div>' +
      '</div>';
  }).join("");

  $("#lesson-box").innerHTML = '<ul class="list neutral">' +
    JOURNAL.lessons.map(function (l) { return '<li><span class="tag">' + esc(l.d) + '</span> ' + esc(l.t) + '</li>'; }).join("") + '</ul>';

  $("#todo-box").innerHTML = '<ul class="list neutral">' +
    JOURNAL.todo.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + '</ul>';

  /* ---------- 定投计算器 ---------- */
  $("#c-run").onclick = function () {
    var m = parseFloat($("#c-monthly").value) || 0;
    var y = parseFloat($("#c-years").value) || 0;
    var ar = parseFloat($("#c-rate").value) || 0;
    var r = ar / 100 / 12, n = y * 12;
    var fv;
    if (r === 0) { fv = m * n; } else { fv = m * (Math.pow(1 + r, n) - 1) / r; }
    var put = m * n;
    var profit = fv - put;
    var fmt = function (x) { return "¥" + Math.round(x).toLocaleString("zh-CN"); };
    $("#c-result").innerHTML =
      '<div class="r-line"><span>累计投入</span><b>' + fmt(put) + '</b></div>' +
      '<div class="r-line"><span>期末市值</span><b>' + fmt(fv) + '</b></div>' +
      '<div class="r-line"><span>累计收益</span><b class="' + (profit >= 0 ? "up" : "down") + '">' + fmt(profit) + '</b></div>' +
      '<div class="r-line"><span>收益率</span><b>' + (put ? ((profit / put) * 100).toFixed(1) : 0) + '%</b></div>' +
      '<div class="r-line" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px">' +
      '<span>相当于单利年化</span><b>' + (y ? ((profit / put) * 100 / y).toFixed(1) : 0) + '%</b></div>';
  };
  $("#c-run").click();

  /* ---------- 检查清单 ---------- */
  (function () {
    var key = "fg-check";
    var state = JSON.parse(localStorage.getItem(key) || "{}");
    function render() {
      $("#check-box").innerHTML = CHECKS.map(function (c, i) {
        var on = !!state[i];
        return '<label class="check ' + (on ? "done" : "") + '"><input type="checkbox" data-i="' + i + '"' + (on ? " checked" : "") + '>' +
          '<div><div class="ck-t">' + esc(c.t) + '</div><div class="ck-d">' + esc(c.d) + '</div></div></label>';
      }).join("") +
        '<div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">' +
        '<span style="font-size:12px;color:var(--text-3)" id="ck-count"></span>' +
        '<button class="btn" style="width:auto;padding:7px 14px;font-size:12.5px" id="ck-reset">重置</button></div>';
      var done = CHECKS.filter(function (_, i) { return state[i]; }).length;
      $("#ck-count").textContent = "已完成 " + done + " / " + CHECKS.length + (done === CHECKS.length ? " · 可以扣款了" : "");
      Array.prototype.forEach.call(document.querySelectorAll("#check-box input"), function (b) {
        b.onchange = function () { state[+b.dataset.i] = b.checked; localStorage.setItem(key, JSON.stringify(state)); render(); };
      });
      $("#ck-reset").onclick = function () { state = {}; localStorage.setItem(key, "{}"); render(); };
    }
    render();
  })();

  /* ---------- 诊断页 ---------- */
  (function () {
    var P = PORTFOLIO;
    var TGT = { bond: 40, nas: 35, gold: 15, cash: 10, other: 0 };
    var META = {
      bond: { n: "债券 / 债基", c: "var(--bond)" },
      nas: { n: "纳斯达克", c: "var(--nas)" },
      gold: { n: "黄金", c: "var(--gold)" },
      cash: { n: "现金 / 货币", c: "var(--text-3)" },
      other: { n: "其他（按权益估算）", c: "var(--warn)" }
    };
    var ORDER = ["bond", "nas", "gold", "cash", "other"];

    $("#pf-howto").innerHTML = P.howto.map(function (h) {
      return '<div style="padding:8px 0;border-bottom:1px dashed var(--line)">' +
        '<div style="font-size:13.5px;font-weight:600">' + h.t + '</div>' +
        '<div style="font-size:12.5px;color:var(--text-2);margin-top:3px">' + h.d + '</div></div>';
    }).join("");

    $("#pf-dims").innerHTML = '<div class="card">' + P.dims.map(function (d) {
      return '<div class="dim-item"><div class="dim-t">' + d.t + '<span class="badge pass">合格线</span></div>' +
        '<div class="dim-p">' + d.pass + '</div>' +
        '<div class="dim-w">' + d.why + '</div></div>';
    }).join("") + '</div>';

    $("#pf-reviews").innerHTML = P.reviews.length
      ? '<div class="tl">' + P.reviews.map(function (r) {
        return '<div class="tl-item"><div class="tl-date">' + r.date + '</div>' +
          '<div class="tl-title">' + r.title + '</div>' +
          '<div class="tl-body">' + r.body + '</div></div>';
      }).join("") + '</div>'
      : '<div class="card"><div class="empty"><span class="e-icon">⌘</span>' +
        '<b>还没有诊断记录</b><br>把持仓截图发给小爪，第一份诊断会归档在这里。<br>' +
        '<span style="font-size:12px">也可以先用上面的自测看看结构。</span></div></div>';

    $("#pf-learn").innerHTML =
      '<div class="card"><div style="font-size:13.5px;margin-bottom:12px">' + P.learn.intro + '</div>' +
      P.learn.levels.map(function (l) {
        return '<div class="lv"><div class="lv-t">' + l.l + '</div>' +
          '<div class="lv-row"><b>现在：</b>' + l.now + '</div>' +
          '<div class="lv-row"><b>下一步：</b>' + l.next + '</div>' +
          (l.book ? '<div class="lv-book">📖 ' + l.book + '</div>' : '') + '</div>';
      }).join("") + '</div>' +
      '<div class="card"><div style="font-size:13.5px;font-weight:700;margin-bottom:8px">固定节奏</div>' +
      '<ul class="list neutral">' + P.learn.routine.map(function (r) { return "<li>" + r + "</li>"; }).join("") + '</ul>' +
      '<div class="note" style="margin-top:10px">' + P.learn.principle + '</div></div>';

    /* ---- 自测计算 ---- */
    var fmt = function (x) {
      var s = Math.abs(Math.round(x)).toLocaleString("zh-CN");
      return (x < 0 ? "-" : "") + "¥" + s;
    };

    function run() {
      var v = {
        bond: parseFloat($("#pf-bond").value) || 0,
        nas: parseFloat($("#pf-nas").value) || 0,
        gold: parseFloat($("#pf-gold").value) || 0,
        cash: parseFloat($("#pf-cash").value) || 0,
        other: parseFloat($("#pf-other").value) || 0
      };
      var cost = parseFloat($("#pf-cost").value) || 0;
      var total = v.bond + v.nas + v.gold + v.cash + v.other;
      if (total <= 0) {
        $("#pf-result").innerHTML = '<div class="empty" style="padding:16px">先填点金额再诊断 🙂</div>';
        return;
      }
      var pct = {};
      ORDER.forEach(function (k) { pct[k] = (v[k] / total) * 100; });
      var core = pct.bond + pct.cash;
      var months = cost > 0 ? v.cash / cost : 999;

      /* 结构条 */
      var struct = ORDER.filter(function (k) { return v[k] > 0; }).map(function (k) {
        var d = pct[k] - TGT[k];
        var note = Math.abs(d) < 5 ? "与目标基本一致" :
          (d > 0 ? "超配 " + d.toFixed(1) + " 个百分点" : "低配 " + Math.abs(d).toFixed(1) + " 个百分点");
        return '<div class="struct"><div class="st-head"><span>' + META[k].n + '　<span style="color:var(--text-3);font-size:11px">目标 ' + TGT[k] + '%</span></span>' +
          '<b>' + pct[k].toFixed(1) + '%</b></div>' +
          '<div class="st-bars"><div class="st-act"><i style="width:' + Math.min(100, pct[k]) + '%;background:' + META[k].c + '"></i></div>' +
          '<div class="st-tgt"><i style="left:' + Math.min(100, TGT[k]) + '%"></i></div></div>' +
          '<div class="st-note">' + fmt(v[k]) + ' · ' + note + '</div></div>';
      }).join("");

      /* 六项体检 */
      var checks = [];
      function add(level, name, now, advice) { checks.push({ level: level, name: name, now: now, advice: advice }); }

      if (core >= 45 && core <= 60) add("pass", "① 核心/卫星结构", "核心 " + core.toFixed(1) + "%", "结构合理，卫星 " + (100 - core).toFixed(1) + "%。");
      else if (core >= 35 && core <= 70) add("warn", "① 核心/卫星结构", "核心 " + core.toFixed(1) + "%", "偏离目标（45–60%）。核心偏薄时，纳指大跌那年你会拿不住。");
      else add("fail", "① 核心/卫星结构", "核心 " + core.toFixed(1) + "%", "核心严重失衡。目标是核心 50%（债 40 + 现金 10）。");

      if (pct.nas <= 35) add("pass", "② 纳指集中度", pct.nas.toFixed(1) + "%", "在 35% 上限内。");
      else if (pct.nas <= 43) add("warn", "② 纳指集中度", pct.nas.toFixed(1) + "%", "略超 35%。不算错，但要确认：跌 30% 你还能睡着吗？");
      else add("fail", "② 纳指集中度", pct.nas.toFixed(1) + "%", "这不是配置，是押注。建议降到 35% 以内。");

      if (pct.gold >= 5 && pct.gold <= 15) add("pass", "③ 黄金对冲层", pct.gold.toFixed(1) + "%", "在 5–15% 的合理区间。");
      else if (pct.gold > 0) add("warn", "③ 黄金对冲层", pct.gold.toFixed(1) + "%", "偏离 5–15%。黄金是对冲不是引擎，超配就是赌金价。");
      else add("warn", "③ 黄金对冲层", "0%", "没有对冲层。股债同跌时你缺少缓冲，建议配到 10–15%。");

      add("warn", "④ 制度摩擦（需自查）", "无法从金额判断", "查一下你持有的场内 ETF 溢价率：<b>&lt;5% 才正常</b>。溢价 10% = 指数不动先亏 10%。");

      add("warn", "⑤ 债券久期（需自查）", "无法从金额判断", "确认债基底层是<b>国内中短久期</b>。若是长久期美债 QDII，2026 年已在亏损（Bloomberg 美国综合债年内 −2.9%）。");

      if (months >= 6) add("pass", "⑥ 现金垫", months.toFixed(1) + " 个月", "现金垫充足，抗风险能力强。");
      else if (months >= 3) add("warn", "⑥ 现金垫", months.toFixed(1) + " 个月", "不足 6 个月。建议先补现金垫，再谈加仓。");
      else add("fail", "⑥ 现金垫", cost > 0 ? months.toFixed(1) + " 个月" : "未填月支出", "现金垫太薄。定投唯一失效的场景就是被迫在低点卖出。");

      var nFail = checks.filter(function (c) { return c.level === "fail"; }).length;
      var nWarn = checks.filter(function (c) { return c.level === "warn"; }).length;
      var overall = nFail ? "fail" : (nWarn > 2 ? "warn" : "pass");
      var overallTxt = nFail ? "有 " + nFail + " 项需要立刻调整" :
        (nWarn > 2 ? "大方向没问题，有细节要修" : "结构健康，按纪律执行即可");

      var checkHtml = checks.map(function (c) {
        var label = c.level === "pass" ? "达标" : (c.level === "warn" ? "注意" : "需调整");
        return '<div class="dim-item"><div class="dim-t">' + c.name +
          '<span class="badge ' + c.level + '">' + label + ' · ' + c.now + '</span></div>' +
          '<div class="dim-w">' + c.advice + '</div></div>';
      }).join("");

      /* 压力测试 */
      var stressHtml = P.stress.map(function (s) {
        var t2 = v.nas * (1 + s.n / 100) + v.gold * (1 + s.g / 100) + v.bond * (1 + s.b / 100) +
          v.cash + v.other * (1 + s.n / 100);
        var d = t2 - total, dp = (d / total) * 100;
        return '<div class="stress-row"><div class="sr-l">' + s.name +
          '<small>' + s.desc + '：纳指 ' + s.n + '% · 黄金 ' + s.g + '% · 债券 +' + s.b + '%</small></div>' +
          '<div class="sr-r"><b class="' + (d < 0 ? "down" : "up") + '">' + dp.toFixed(1) + '%</b>' +
          '<div style="font-size:11px;color:var(--text-3)">' + fmt(d) + ' → ' + fmt(t2) + '</div></div></div>';
      }).join("");

      /* 再平衡建议 */
      var rebalHtml = ORDER.filter(function (k) { return v[k] > 0 || TGT[k] > 0; }).map(function (k) {
        var aim = total * TGT[k] / 100;
        var diff = aim - v[k];
        if (Math.abs(diff) < total * 0.02) {
          return '<div class="rebal"><span>' + META[k].n + '</span><span class="rb-v" style="color:var(--text-3)">持平，不动</span></div>';
        }
        var act = diff > 0 ? "加仓 " + fmt(diff) : "减仓 " + fmt(-diff);
        return '<div class="rebal"><span>' + META[k].n + '<span style="font-size:11px;color:var(--text-3)"> ' +
          pct[k].toFixed(1) + '% → ' + TGT[k] + '%</span></span>' +
          '<span class="rb-v ' + (diff > 0 ? "up" : "down") + '">' + act + '</span></div>';
      }).join("");

      $("#pf-result").innerHTML =
        '<div class="result" style="margin-top:14px">' +
        '<div class="r-line"><span>总资产</span><b>' + fmt(total) + '</b></div>' +
        '<div class="r-line"><span>核心 / 卫星</span><b>' + core.toFixed(1) + '% / ' + (100 - core).toFixed(1) + '%</b></div>' +
        '<div class="r-line"><span>现金垫</span><b>' + (cost > 0 ? months.toFixed(1) + " 个月" : "—") + '</b></div>' +
        '<div class="r-line" style="border-top:1px solid var(--line);margin-top:6px;padding-top:8px">' +
        '<span>综合判断</span><b><span class="badge ' + overall + '">' + overallTxt + '</span></b></div>' +
        '</div>' +

        '<div class="sec-title" style="margin:18px 0 8px">结构（粗条=实际，细刻度=目标）</div>' + struct +

        '<div class="sec-title" style="margin:18px 0 8px">六项体检</div>' +
        '<div class="card">' + checkHtml + '</div>' +

        '<div class="sec-title" style="margin:18px 0 8px">压力测试 · 跌下去会怎样</div>' +
        '<div class="card">' + stressHtml +
        '<div class="note" style="margin-top:10px">' + P.stressNote + '</div></div>' +

        '<div class="sec-title" style="margin:18px 0 8px">再平衡建议（偏离 ±5% 才动手）</div>' +
        '<div class="card">' + rebalHtml +
        '<div class="note" style="margin-top:10px">建议<b>用新增资金补低配的那一项</b>，而不是卖出超配的那一项——少一次交易，少一次费用和情绪波动。每季度只做一次。</div></div>';
    }

    $("#pf-run").onclick = run;
    run();
  })();
})();
