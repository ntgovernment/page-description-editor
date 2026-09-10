const x = /* @__PURE__ */ new Map();
function C() {
  return typeof window.Squiz_Matrix_API < "u";
}
function h(t, e, a) {
  return new Promise((r) => {
    window.setTimeout(() => {
      x.set(`${t}:${e}`, a), r(a);
    }, 250);
  });
}
function S() {
  return C() ? window.Squiz_Matrix_API : null;
}
function w(t, e) {
  const a = S();
  return !a || typeof a[t] != "function" ? Promise.reject(new Error(`Squiz Matrix API method ${t} is unavailable.`)) : new Promise((r, n) => {
    a[t]({
      ...e,
      dataCallback: r,
      errorCallback: () => n(new Error("Squiz Matrix did not save this change."))
    });
  });
}
function c() {
  return !C();
}
function A(t, e) {
  return c() ? h(t, "status", e) : w("setAssetStatus", { asset_id: t, status: e });
}
function _(t, e) {
  return c() ? h(t, "name", e) : w("setAttribute", {
    asset_id: t,
    attr_name: "name",
    attr_val: e
  });
}
function k(t, e) {
  return c() ? Promise.resolve(x.get(`${t}:web-path`) || e) : w("getWebPath", { asset_id: t });
}
function M(t, e) {
  return c() ? h(t, "web-path", e) : Promise.reject(
    new Error(
      "Web-path saving is disabled until the Matrix DEV getWebPath and setWebPath payload contract is confirmed. This prevents alternate URLs from being removed."
    )
  );
}
function L(t, e, a) {
  return c() ? h(t, `metadata:${e}`, a) : w("setMetadata", {
    asset_id: t,
    field_id: e,
    field_val: a
  });
}
const y = [
  { value: "1", label: "Archive" },
  { value: "2", label: "Under Construction" },
  { value: "16", label: "Live" },
  { value: "64", label: "Safe Editing" }
], q = new Map(y.map((t) => [t.label, t.value])), m = document.querySelector("#page-metadata-editor"), g = document.querySelector(".editor-results");
let p = null;
function P(t, e) {
  const a = e.toLowerCase().replace(/\s+/g, "-");
  t.closest("td")?.setAttribute("data-status", a);
}
function b(t, e = "success") {
  g.textContent = t, g.dataset.kind = e;
}
function f(t) {
  return {
    status: "Status",
    name: "Page name",
    "web-path": "Web path",
    description: "Page description"
  }[t];
}
function W(t) {
  return t.dataset.displayValue ?? t.textContent.trim();
}
function $(t, e) {
  if (t === "status") {
    const r = document.createElement("select");
    return r.className = "editor-control", r.setAttribute("aria-label", "Status"), y.forEach((n) => {
      const s = document.createElement("option");
      s.value = n.value, s.textContent = n.label, s.selected = n.value === q.get(e), r.append(s);
    }), r;
  }
  const a = document.createElement(t === "description" ? "textarea" : "input");
  return a.className = "editor-control", a.setAttribute("aria-label", f(t)), a.value = e, t === "description" ? a.rows = 3 : a.type = "text", a;
}
function d(t, e) {
  t.replaceChildren(document.createTextNode(e)), t.dataset.displayValue = e, p = null, t.focus();
}
function V(t, e) {
  return t !== "description" && !e.trim() ? `${f(t)} cannot be empty.` : t === "web-path" && (!e.startsWith("/") || e.includes("://")) ? "Web path must begin with / and must not be a full URL." : "";
}
async function N(t, e, a, r) {
  const n = a.value.trim(), s = V(e, n);
  if (s) {
    b(s, "error"), a.focus();
    return;
  }
  const i = t.closest("tr")?.dataset.assetId;
  if (!i) {
    b("This row does not include a Matrix asset ID.", "error");
    return;
  }
  a.disabled = !0;
  const o = t.querySelectorAll("button");
  o.forEach((u) => {
    u.disabled = !0;
  });
  try {
    if (e === "status") {
      const u = y.find((v) => v.value === n);
      await A(i, Number(n)), P(t, u.label), d(t, u.label);
    } else e === "name" ? (await _(i, n), d(t, n)) : e === "web-path" ? (await M(i, n), t.dataset.webPath = n, d(t, c() ? `https://example.local${n}` : n)) : (await L(i, t.dataset.metadatafieldid, n), d(t, n));
    b(`${f(e)} saved.`, "success");
  } catch (u) {
    a.disabled = !1, o.forEach((v) => {
      v.disabled = !1;
    }), b(u.message || "The change could not be saved.", "error"), a.focus();
  }
}
async function E(t) {
  if (p || t.querySelector(".editor-control"))
    return;
  const e = t.dataset.editorField, a = W(t);
  let r = a;
  if (p = t, e === "web-path")
    try {
      r = await k(t.closest("tr")?.dataset.assetId, t.dataset.webPath || a);
    } catch (o) {
      p = null, b(o.message || "The web path could not be loaded.", "error");
      return;
    }
  const n = $(e, r), s = document.createElement("div");
  s.className = "editor-actions";
  const l = document.createElement("button");
  l.type = "button", l.textContent = "Save";
  const i = document.createElement("button");
  i.type = "button", i.textContent = "Cancel", i.className = "secondary-action", s.append(l, i), t.replaceChildren(n, s), n.focus(), l.addEventListener("click", () => N(t, e, n)), i.addEventListener("click", () => d(t, a)), n.addEventListener("keydown", (o) => {
    o.key === "Escape" && (o.preventDefault(), d(t, a));
  });
}
m && (m.querySelectorAll(".edit_area[data-editor-field]").forEach((t) => {
  t.tabIndex = 0, t.setAttribute("role", "button"), t.dataset.label = f(t.dataset.editorField), t.setAttribute("aria-label", `Edit ${f(t.dataset.editorField)}`), t.dataset.editorField === "status" && P(t, t.textContent.trim());
}), m.addEventListener("click", (t) => {
  const e = t.target.closest(".edit_area[data-editor-field]");
  e && !t.target.closest("button, input, select, textarea") && E(e);
}), m.addEventListener("keydown", (t) => {
  const e = t.target.closest(".edit_area[data-editor-field]");
  e && (t.key === "Enter" || t.key === " ") && (t.preventDefault(), E(e));
}));
