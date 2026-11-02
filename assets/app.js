/* IndustryBench-DE Live: renders the results and report pages from data/*.json. No dependencies. */
"use strict";
(() => {
  const LANG = document.documentElement.lang === "en" ? "en" : "de";
  const ROOT = document.body.dataset.root || "";
  const PAGE = document.body.dataset.page;
  const LOCALE = LANG === "de" ? "de-DE" : "en-GB";
  const nf = d => new Intl.NumberFormat(LOCALE, { minimumFractionDigits: d, maximumFractionDigits: d });
  const F2 = nf(2), F1 = nf(1), F0 = nf(0);
  const PCT = LANG === "de" ? " %" : "%";
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  const S = {
    de: {
      areas: { mechanical: "Maschinenbau", electrical: "Elektrotechnik", chemical: "Chemie", energy: "Energie" },
      skills: { standards_terminology: "Normen & Begriffe", selection_substitution: "Auswahl & Ersatz",
                safety_compliance: "Sicherheit & Konformität", fault_diagnosis: "Fehlerdiagnose" },
      metrics: {
        score: ["Punkte", "Durchschnittliche Punkte pro Frage, von 0 bis 3. Höher ist besser."],
        safe: ["Sichere Punkte", "Wie Punkte, aber eine Antwort mit einer gefährlichen Empfehlung zählt 0. Höher ist besser."],
        danger: ["Gefährliche Antworten", "Anteil der Antworten, die eine Sicherheitsregel verletzen. Niedriger ist besser, darum steht das sicherste Modell oben."],
        rules: ["Regeln eingehalten", "Anteil der Antworten, die keine der geprüften Regeln verletzen. Höher ist besser."],
      },
      allQuestions: n => `Alle ${n} Fragen`, area: "Bereich", skill: "Fragetyp", model: "Modell", questions: "Fragen",
      counting: s => ` Gezählt: ${s}.`, allLower: n => `alle ${n} Fragen`, allCol: "Alle",
      gradedBy: g => `Bewertet von ${g}`, and: " und ", avg: v => `${v} Punkte im Schnitt`,
      full: "ganz richtig", part: "teilweise richtig", wrong: "falsch", ofAnswers: (n, t) => `${n} von ${t} Antworten`,
      pointsShort: "Punkte", danger: "Gefährlich", batch: b => b.length > 1 ? `Batches ${b.join(" + ")}` : `Batch ${b[0]}`,
      date: d => new Date(d + "T00:00:00").toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" }),
      loadErr: "Die Daten konnten nicht geladen werden. Bitte die Seite neu laden.",
      stages: { generate: "Geschrieben", filter: "Zitatprüfung", verify: "Inhaltsprüfung", calibrate: "Schwierigkeitstest" },
      reasons: { SOURCE_REFERENCE: "verweist auf Material, das der Prüfling nicht sieht", QUESTION_LENGTH: "zu lang oder zu kurz",
                 NEAR_DUPLICATE: "fast gleich wie eine andere Frage", QUOTE_NOT_FOUND: "Zitat nicht in der Quelle",
                 NOT_SELF_CONTAINED: "braucht Angaben, die nicht in der Frage stehen", ANSWER_NOT_SUPPORTED: "Antwort nicht durch die Regeln gedeckt",
                 VITAL_FACT_UNSUPPORTED: "zentrale Aussage nicht belegt", RUBRIC: "Qualitätsregeln", labelsOnly: "nur Einstufung, nichts entfernt" },
      kinds: { regulation: "Regelwerke", manual: "Betriebsanleitungen", sds: "Sicherheitsdatenblätter", datasheet: "Datenblätter" },
    },
    en: {
      areas: { mechanical: "Mechanical", electrical: "Electrical", chemical: "Chemical", energy: "Energy" },
      skills: { standards_terminology: "Standards & terms", selection_substitution: "Selection & substitution",
                safety_compliance: "Safety & compliance", fault_diagnosis: "Fault diagnosis" },
      metrics: {
        score: ["Points", "Average points per question, from 0 to 3. Higher is better."],
        safe: ["Safe points", "Like points, but an answer that recommends something dangerous counts as 0. Higher is better."],
        danger: ["Dangerous answers", "Share of answers that broke a safety rule. Lower is better, so the safest model is on top."],
        rules: ["Follows the rules", "Share of answers that broke none of the rules the question checks. Higher is better."],
      },
      allQuestions: n => `All ${n} questions`, area: "Area", skill: "Question type", model: "Model", questions: "Questions",
      counting: s => ` Counting ${s}.`, allLower: n => `all ${n} questions`, allCol: "All",
      gradedBy: g => `Graded by ${g}`, and: " and ", avg: v => `${v} points on average`,
      full: "fully right", part: "partly right", wrong: "wrong", ofAnswers: (n, t) => `${n} of ${t} answers`,
      pointsShort: "Points", danger: "Dangerous", batch: b => b.length > 1 ? `Batches ${b.join(" + ")}` : `Batch ${b[0]}`,
      date: d => new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }),
      loadErr: "The data could not be loaded. Please reload the page.",
      stages: { generate: "Written", filter: "Quote check", verify: "Content check", calibrate: "Difficulty test" },
      reasons: { SOURCE_REFERENCE: "points at material the test-taker cannot see", QUESTION_LENGTH: "too long or too short",
                 NEAR_DUPLICATE: "near-duplicate of another question", QUOTE_NOT_FOUND: "quote not found in the source",
                 NOT_SELF_CONTAINED: "needs information not in the question", ANSWER_NOT_SUPPORTED: "answer not backed by the rules",
                 VITAL_FACT_UNSUPPORTED: "key fact not backed", RUBRIC: "quality rules", labelsOnly: "labels only, nothing removed" },
      kinds: { regulation: "Rule books", manual: "Operating manuals", sds: "Safety data sheets", datasheet: "Data sheets" },
    },
  }[LANG];

  const METRIC_SCALE = {
    score: { max: 3, ticks: [0, 1, 2, 3], better: "high", fmt: v => F2.format(v), tick: t => F0.format(t) },
    safe: { max: 3, ticks: [0, 1, 2, 3], better: "high", fmt: v => F2.format(v), tick: t => F0.format(t) },
    danger: { max: 50, ticks: [0, 10, 20, 30, 40, 50], better: "low", fmt: v => F1.format(v) + PCT, tick: t => t + PCT },
    rules: { max: 100, ticks: [0, 25, 50, 75, 100], better: "high", fmt: v => F0.format(v) + PCT, tick: t => t + PCT },
  };
  const $ = id => document.getElementById(id);
  const state = { metric: "score", subset: "all", split: "domain", data: null, index: null };

  async function load(path) {
    const r = await fetch(ROOT + path, { cache: "no-cache" });
    if (!r.ok) throw new Error(`${path}: ${r.status}`);
    return r.json();
  }
  function fail(err) {
    console.error(err);
    document.querySelectorAll("[data-needs-data]").forEach(el => { el.innerHTML = `<p class="notice">${esc(S.loadErr)}</p>`; });
  }

  /* Shared tooltip: pointer and keyboard */
  const tip = $("tip");
  function place(x, y) {
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.max(8, Math.min(x + 14, innerWidth - r.width - 8)) + "px";
    tip.style.top = Math.max(8, y - r.height - 12) + "px";
  }
  function bindTip(el, html) {
    if (!tip) return;
    el.addEventListener("pointermove", e => { tip.innerHTML = html(); tip.hidden = false; place(e.clientX, e.clientY); });
    el.addEventListener("pointerleave", () => { tip.hidden = true; });
    el.addEventListener("focus", () => { tip.innerHTML = html(); tip.hidden = false; const b = el.getBoundingClientRect(); place(b.left + Math.min(b.width, 200) / 2, b.top); });
    el.addEventListener("blur", () => { tip.hidden = true; });
  }
  addEventListener("scroll", () => { if (tip) tip.hidden = true; }, { passive: true });

  function press(groupId, attr, value) {
    document.querySelectorAll(`#${groupId} button`).forEach(b => b.setAttribute("aria-pressed", String(b.dataset[attr] === value)));
  }

  /* ---------- Results page ---------- */
  const models = () => state.data.models;
  function pick(m, subset) {
    if (subset === "all") return m.all;
    const [dim, key] = subset.split(":");
    return m[dim][key];
  }
  function subsetName(subset) {
    if (subset === "all") return S.allLower(state.data.questions);
    const [dim, key] = subset.split(":");
    return (dim === "domain" ? S.areas : S.skills)[key];
  }
  const graders = m => m.graders.join(S.and);
  const nameCell = m => `<div class="bname"><span class="nm">${esc(m.name)}</span><span class="sub">${esc(m.maker)}</span></div>`;
  function tipFor(m, a) {
    return `<strong>${esc(m.name)}</strong> · ${esc(subsetName(state.subset))} (${a.n})<br>` +
      `${S.metrics.score[0]} ${F2.format(a.score)} · ${S.metrics.safe[0]} ${F2.format(a.safe)}<br>` +
      `${S.danger} ${F1.format(a.danger)}${PCT} · ${S.metrics.rules[0]} ${F0.format(a.rules)}${PCT}<br>` +
      `<span style="opacity:.8">${esc(S.gradedBy(graders(m)))}</span>`;
  }

  function renderTitle() {
    const d = state.data;
    $("tb-release").textContent = `Release ${d.release} · ${S.batch(d.batches)} · ${S.date(d.date)}`;
    $("tb-questions").textContent = d.questions;
    $("tb-models").textContent = d.models.length;
    $("tb-best").textContent = F2.format(Math.max(...d.models.map(m => m.all.score))) + " / 3";
    $("tb-next").textContent = state.index.next[LANG];
  }

  function renderSubsetOptions() {
    const c = state.data.counts, sel = $("subset");
    const opt = (v, t) => `<option value="${v}">${esc(t)}</option>`;
    sel.innerHTML = opt("all", S.allQuestions(state.data.questions)) +
      `<optgroup label="${S.area}">${Object.keys(S.areas).filter(k => c.domain[k]).map(k => opt(`domain:${k}`, `${S.areas[k]} (${c.domain[k]})`)).join("")}</optgroup>` +
      `<optgroup label="${S.skill}">${Object.keys(S.skills).filter(k => c.capability[k]).map(k => opt(`capability:${k}`, `${S.skills[k]} (${c.capability[k]})`)).join("")}</optgroup>`;
    if (![...sel.options].some(o => o.value === state.subset)) state.subset = "all";
    sel.value = state.subset;
  }

  function renderBars() {
    const met = METRIC_SCALE[state.metric], [title, note] = S.metrics[state.metric];
    const rows = models().map(m => ({ m, a: pick(m, state.subset) }));
    rows.sort((x, y) => met.better === "high" ? y.a[state.metric] - x.a[state.metric] : x.a[state.metric] - y.a[state.metric]);
    $("metric-title").textContent = title + ": ";
    $("metric-note").textContent = note + (state.subset === "all" ? "" : S.counting(subsetName(state.subset)));
    const tickPct = 100 / (met.ticks.length - 1);
    const bars = $("bars");
    bars.innerHTML = rows.map(({ m, a }) => {
      const v = a[state.metric], w = Math.min(100, v / met.max * 100);
      return `<div class="brow" role="listitem" tabindex="0" data-key="${esc(m.key)}" aria-label="${esc(m.name)}: ${esc(title)} ${esc(met.fmt(v))}">
        ${nameCell(m)}
        <div class="btrack" style="--tick:${tickPct}%"><div class="bfill" style="width:${w}%"></div></div>
        <span class="bval">${met.fmt(v)}</span></div>`;
    }).join("");
    $("ticks").innerHTML = met.ticks.map(t => `<span style="left:${t / met.max * 100}%">${met.tick(t)}</span>`).join("");
    bars.querySelectorAll(".brow").forEach(el => {
      const m = models().find(x => x.key === el.dataset.key);
      bindTip(el, () => tipFor(m, pick(m, state.subset)));
    });
    $("bars-table").innerHTML = `<thead><tr><th>${S.model}</th><th class="num">${S.metrics.score[0]}</th><th class="num">${S.metrics.safe[0]}</th><th class="num">${S.danger}</th><th class="num">${S.metrics.rules[0]}</th><th class="num">${S.questions}</th></tr></thead><tbody>` +
      rows.map(({ m, a }) => `<tr><td>${esc(m.name)}</td><td class="num">${F2.format(a.score)}</td><td class="num">${F2.format(a.safe)}</td><td class="num">${F1.format(a.danger)}${PCT}</td><td class="num">${F0.format(a.rules)}${PCT}</td><td class="num">${a.n}</td></tr>`).join("") + `</tbody>`;
  }

  function seqColor(v) {
    const t = Math.max(0, Math.min(1, v / 3));
    return { bg: `color-mix(in oklab, var(--seq-hi) ${Math.round(t * 100)}%, var(--seq-lo))`, cls: t > 0.55 ? "hi" : "lo" };
  }
  function renderHeat() {
    const names = state.split === "domain" ? S.areas : S.skills;
    const cols = Object.keys(names).filter(k => state.data.counts[state.split][k]);
    const order = [...models()].sort((a, b) => b.all.score - a.all.score);
    const heat = $("heat");
    heat.innerHTML = `<thead><tr><th>${S.model}</th>${cols.map(k => `<th class="col">${esc(names[k])}</th>`).join("")}<th class="col">${S.allCol}</th></tr></thead><tbody>` +
      order.map(m => `<tr><td>${nameCell(m)}</td>` +
        [...cols.map(k => [m[state.split][k], names[k]]), [m.all, S.allCol]].map(([a, n]) => {
          const c = seqColor(a.score);
          return `<td class="cell ${c.cls}" tabindex="0" style="background:${c.bg}" data-key="${esc(m.key)}" data-n="${esc(n)}">${F2.format(a.score)}</td>`;
        }).join("") + `</tr>`).join("") + `</tbody>`;
    heat.querySelectorAll("td.cell").forEach(el => {
      const m = models().find(x => x.key === el.dataset.key);
      bindTip(el, () => `<strong>${esc(m.name)}</strong> · ${esc(el.dataset.n)}<br>${esc(S.avg(el.textContent))}`);
    });
  }

  function renderSpread() {
    const order = [...models()].sort((a, b) => b.all.score - a.all.score);
    const box = $("spread");
    box.innerHTML = order.map(m => {
      const d = m.dist, total = d.full + d.mostly + d.little + d.zero;
      const parts = [["ok", d.full, S.full], ["part", d.mostly + d.little, S.part], ["bad", d.zero, S.wrong]];
      return `<div class="srow">${nameCell(m)}<div class="sbar" role="img" aria-label="${esc(m.name)}: ${parts.map(p => p[1] + " " + p[2]).join(", ")} (${total})">` +
        parts.map(([c, n], i) => `<span class="sseg s-${c}" tabindex="0" style="flex:${n} 1 0" data-key="${esc(m.key)}" data-i="${i}">${n / total >= 0.07 ? n : ""}</span>`).join("") +
        `</div></div>`;
    }).join("");
    box.querySelectorAll(".sseg").forEach(el => {
      const m = models().find(x => x.key === el.dataset.key), d = m.dist, total = d.full + d.mostly + d.little + d.zero;
      const [n, lab] = [[d.full, S.full], [d.mostly + d.little, S.part], [d.zero, S.wrong]][el.dataset.i];
      bindTip(el, () => `<strong>${esc(m.name)}</strong><br>${esc(S.ofAnswers(n, total))} ${esc(lab)} (${F0.format(n / total * 100)}${PCT})`);
    });
    $("spread-table").innerHTML = `<thead><tr><th>${S.model}</th><th class="num">${S.full}</th><th class="num">${S.part}</th><th class="num">${S.wrong}</th></tr></thead><tbody>` +
      order.map(m => `<tr><td>${esc(m.name)}</td><td class="num">${m.dist.full}</td><td class="num">${m.dist.mostly + m.dist.little}</td><td class="num">${m.dist.zero}</td></tr>`).join("") + `</tbody>`;
  }

  function renderChanges() {
    $("changes").innerHTML = state.index.releases.map(r => `<li><div class="rel"><strong>${esc(r.id)}</strong><span class="small muted">${esc(S.date(r.date))}</span></div>
      <ul>${r.changes[LANG].map(t => `<li>${esc(t)}</li>`).join("")}</ul></li>`).join("");
  }

  function renderResults() {
    renderTitle(); renderSubsetOptions(); renderBars(); renderHeat(); renderSpread();
  }

  async function showRelease(id) {
    const rel = state.index.releases.find(r => r.id === id) || state.index.releases.find(r => r.id === state.index.latest);
    state.data = await load(rel.file);
    $("release").value = rel.id;
    renderResults();
  }

  async function initResults() {
    state.index = await load("data/releases.json");
    const sel = $("release");
    sel.innerHTML = state.index.releases.map(r => `<option value="${esc(r.id)}">${esc(r.id)} · ${esc(S.batch(r.batches))}</option>`).join("");
    sel.addEventListener("change", () => { location.hash = sel.value; });
    addEventListener("hashchange", () => showRelease(location.hash.slice(1)).catch(fail));
    $("metric").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      state.metric = b.dataset.m; press("metric", "m", state.metric); renderBars();
    });
    $("subset").addEventListener("change", e => { state.subset = e.target.value; renderBars(); });
    $("split").addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      state.split = b.dataset.s; press("split", "s", state.split); renderHeat();
    });
    renderChanges();
    await showRelease(location.hash.slice(1));
  }

  /* ---------- Report page ---------- */
  function initExample() {
    const ex = $("ex"), hl = $("hl");
    if (!ex || !hl) return;
    hl.addEventListener("click", e => {
      const b = e.target.closest("button"); if (!b) return;
      b.setAttribute("aria-pressed", String(b.getAttribute("aria-pressed") !== "true"));
      ex.dataset.off = [...hl.querySelectorAll("button")].filter(x => x.getAttribute("aria-pressed") === "false").map(x => x.dataset.k).join(" ");
    });
  }

  function reasonText(reasons) {
    const merged = {};
    for (const [code, n] of Object.entries(reasons || {})) {
      const key = code.startsWith("RUBRIC_") ? "RUBRIC" : code;
      merged[key] = (merged[key] || 0) + n;
    }
    return Object.entries(merged).sort((a, b) => b[1] - a[1]).map(([k, n]) => `${S.reasons[k] || k} (${n})`).join(", ");
  }

  async function initReport() {
    initExample();
    const [index, labels] = await Promise.all([load("data/releases.json"), load("data/labels.json")]);
    const latest = index.releases.find(r => r.id === index.latest);
    const d = await load(latest.file);
    document.querySelectorAll("[data-fill]").forEach(el => {
      const v = { questions: d.questions, release: d.release, rulebooks: d.rule_books.length,
                  documents: Object.values(d.documents).reduce((a, b) => a + b, 0) }[el.dataset.fill];
      if (v !== undefined) el.textContent = v;
    });
    $("doc-kinds").innerHTML = Object.keys(S.kinds).filter(k => d.documents[k]).map(k =>
      `<div><span class="label">${esc(S.kinds[k])}</span><span class="val">${d.documents[k]}</span></div>`).join("");
    $("rulebooks").innerHTML = d.rule_books.filter(r => r.questions > 0).sort((a, b) => b.questions - a.questions).map(r => {
      const l = labels.rule_books[r.doc_id];
      return `<tr><td title="${esc(r.title)}">${esc(l ? l[LANG] : r.title)}</td><td class="num">${r.questions}</td></tr>`;
    }).join("");
    $("funnel").innerHTML = d.funnel.map(f => `<tr><td>${esc(S.stages[f.stage] || f.stage)}</td><td class="num"><strong>${f.left}</strong></td><td class="num">${f.removed || 0}</td>` +
      `<td class="muted small">${esc(f.stage === "calibrate" ? S.reasons.labelsOnly : reasonText(f.reasons))}</td></tr>`).join("");
  }

  const init = PAGE === "results" ? initResults : PAGE === "report" ? initReport : null;
  if (init) init().catch(fail);
})();
