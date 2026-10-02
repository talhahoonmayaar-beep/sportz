(function () {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const val = (id) => {
    const el = $(id);
    if (!el) return NaN;
    const n = parseFloat(String(el.value).replace(/,/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const fmt = (n, d = 2) => {
    if (!Number.isFinite(n)) return "—";
    const r = Math.round(n * 10 ** d) / 10 ** d;
    return r.toLocaleString("en-US", { maximumFractionDigits: d });
  };
  const markInvalid = (id, bad) => {
    const el = $(id);
    if (el) el.classList.toggle("invalid", bad);
  };
  const anyInvalid = (ids) => ids.some((id) => !Number.isFinite(val(id)));

  const areaSqft = (shape, L, W) => {
    if (shape === "circle") return (Math.PI * L * L) / 4;
    if (shape === "triangle") return (L * W) / 2;
    return L * W;
  };

  const chip = (label, value) =>
    `<span class="chip">${label}: <b>${value}</b></span>`;

  const CALCS = {
    gravel: () => {
      const ids = ["gLength", "gWidth", "gDepth"];
      const shape = $("gShape").value;
      const L = val("gLength"), W = shape === "circle" ? L : val("gWidth"), D = val("gDepth");
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      markInvalid("gWidth", shape !== "circle" && !Number.isFinite(W));
      if (anyInvalid(ids) || (shape !== "circle" && !Number.isFinite(W))) {
        return err("Enter the length, width and depth of your area to see results.");
      }
      const du = $("gDunit").value;
      const depthFt = du === "in" ? D / 12 : D;
      const density = { pea: 1.45, crushed: 1.4, river: 1.3, sand: 1.35, topsoil: 1.15 }[$("gMat").value] || 1.4;
      const waste = val("gWaste") || 0;
      const price = val("gPrice");
      const area = areaSqft(shape, L, W);
      const ydRaw = (area * depthFt) / 27;
      const yd = ydRaw * (1 + waste / 100);
      const tons = yd * density;
      const mtons = tons * 0.90718;
      const loads = Math.ceil(yd / 2.5);
      const cost = Number.isFinite(price) ? tons * price : null;
      const matName = $("gMat").selectedOptions[0].text.replace(/\s*\(.*\)$/, "");
      return ok(
        `<p class="big">${fmt(yd)} cubic yards</p><p class="muted">≈ ${fmt(tons)} US tons of ${matName} for a ${fmt(area, 0)} sq ft area at ${fmt(depthFt * 12, 1)}″ deep.</p>`,
        [
          chip("Cubic feet", fmt(yd * 27, 1)),
          chip("Metric tonnes", fmt(mtons)),
          chip("Pickup loads (~2.5 yd³)", loads),
          chip("With " + waste + "% waste", "included"),
          ...(cost !== null ? [chip("Est. material cost", "$" + fmt(cost)) ] : []),
        ]
      );
    },

    mulch: () => {
      const ids = ["mLength", "mWidth", "mDepth"];
      const shape = $("mShape").value;
      const L = val("mLength"), W = shape === "circle" ? L : val("mWidth"), D = val("mDepth");
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      if (anyInvalid(ids) || (shape !== "circle" && !Number.isFinite(W))) {
        return err("Enter the length, width and mulch depth to see results.");
      }
      const area = areaSqft(shape, L, W);
      const cuft = (area * D) / 12;
      const waste = val("mWaste") || 0;
      const yd = (cuft * (1 + waste / 100)) / 27;
      const bagSize = parseFloat($("mBag").value);
      const bags = Math.ceil((cuft * (1 + waste / 100)) / bagSize);
      const price = val("mPrice");
      const cost = Number.isFinite(price) ? yd * price : null;
      return ok(
        `<p class="big">${fmt(yd)} cubic yards</p><p class="muted">or ${bags} bags (${bagSize} cu ft each) for ${fmt(area, 0)} sq ft at ${fmt(D, 1)}″ deep.</p>`,
        [
          chip("Cubic feet", fmt(cuft * (1 + waste / 100), 1)),
          chip("Bags needed", bags),
          chip("With " + waste + "% waste", "included"),
          ...(cost !== null ? [chip("Est. bulk cost", "$" + fmt(cost))] : []),
        ]
      );
    },

    paint: () => {
      const ids = ["pLength", "pWidth", "pHeight", "pCoats", "pCoverage"];
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      if (anyInvalid(ids)) return err("Enter the room dimensions, coats and paint coverage.");
      const L = val("pLength"), W = val("pWidth"), H = val("pHeight");
      const coats = Math.max(1, Math.round(val("pCoats")));
      const doors = val("pDoors") || 0, wins = val("pWindows") || 0;
      const cov = val("pCoverage") || 350;
      const price = val("pPrice");
      let walls = 2 * (L + W) * H;
      const openings = doors * 21 + wins * 15;
      let net = Math.max(0, walls - openings);
      if ($("pCeiling").checked) net += L * W;
      const total = net * coats;
      const gallonsExact = total / cov;
      const gallons = Math.ceil(gallonsExact);
      const cost = Number.isFinite(price) ? gallons * price : null;
      return ok(
        `<p class="big">${gallons} gallon${gallons === 1 ? "" : "s"}</p><p class="muted">≈ ${fmt(gallonsExact)} gal for ${fmt(total, 0)} sq ft of paintable area (${coats} coat${coats > 1 ? "s" : ""}).</p>`,
        [
          chip("Wall area", fmt(2 * (L + W) * H, 0) + " sq ft"),
          chip("Openings deducted", fmt(openings, 0) + " sq ft"),
          chip("Liters", fmt(gallonsExact * 3.785, 1) + " L"),
          chip("Buy in", gallons % 5 === 0 ? "5-gal pails" : "1-gal cans"),
          ...(cost !== null ? [chip("Est. paint cost", "$" + fmt(cost))] : []),
        ]
      );
    },

    fence: () => {
      const ids = ["fLength", "fPanel"];
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      if (anyInvalid(ids)) return err("Enter the total fence length and panel width.");
      const len = val("fLength"), pw = val("fPanel") || 6;
      const gates = Math.round(val("fGates") || 0);
      const price = val("fPrice");
      const panels = Math.ceil(len / pw);
      const posts = panels + 1 + gates;
      const rails = panels * 2;
      const cost = Number.isFinite(price) ? panels * price : null;
      return ok(
        `<p class="big">${panels} panels · ${posts} posts</p><p class="muted">for a ${fmt(len, 0)} ft run with ${fmt(pw, 1)} ft panel spacing${gates ? ` and ${gates} gate${gates > 1 ? "s" : ""}` : ""}.</p>`,
        [
          chip("Panels", panels),
          chip("Posts", posts),
          chip("Rails (2-rail)", rails),
          chip("Linear feet", fmt(len, 0) + " ft"),
          ...(cost !== null ? [chip("Est. panel cost", "$" + fmt(cost))] : []),
        ]
      );
    },

    paver: () => {
      const ids = ["aLength", "aWidth"];
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      if (anyInvalid(ids)) return err("Enter the length and width of your paved area.");
      const L = val("aLength"), W = val("aWidth");
      const waste = val("aWaste") || 0;
      const price = val("aPrice");
      const [pw, ph] = $("aSize").value.split("x").map(Number);
      const ppsf = (pw * ph) / 144;
      const area = L * W;
      const mult = { stack: 1, running: 1.05, herring: 1.1 }[$("aPattern").value] || 1;
      const raw = area / ppsf;
      const count = Math.ceil(raw * mult * (1 + waste / 100));
      const cost = Number.isFinite(price) ? count * price : null;
      const perPallet = 100;
      const pallets = Math.ceil(count / perPallet);
      return ok(
        `<p class="big">${count.toLocaleString("en-US")} pavers</p><p class="muted">${$("aSize").selectedOptions[0].text} size for ${fmt(area, 0)} sq ft${$("aPattern").value !== "stack" ? " in " + $("aPattern").selectedOptions[0].text.toLowerCase() + " pattern" : ""}.</p>`,
        [
          chip("Exact count", Math.ceil(raw * mult).toLocaleString("en-US")),
          chip("Waste " + waste + "%", "included"),
          chip("Sq ft covered", fmt(area, 0)),
          chip("Pallets (~100)", pallets),
          ...(cost !== null ? [chip("Est. paver cost", "$" + fmt(cost))] : []),
        ]
      );
    },

    sod: () => {
      const ids = ["sLength", "sWidth"];
      ids.forEach((id) => markInvalid(id, !Number.isFinite(val(id))));
      if (anyInvalid(ids)) return err("Enter the length and width of your lawn area.");
      const L = val("sLength"), W = val("sWidth");
      const waste = val("sWaste") || 0;
      const palletSqft = parseFloat($("sPallet").value);
      const price = val("sPrice");
      const area = L * W;
      const aw = area * (1 + waste / 100);
      const pallets = Math.ceil(aw / palletSqft);
      const rolls = Math.ceil(aw / 10);
      const cost = Number.isFinite(price) ? pallets * price : null;
      return ok(
        `<p class="big">${pallets} pallet${pallets === 1 ? "" : "s"} of sod</p><p class="muted">${fmt(aw, 0)} sq ft ordered for a ${fmt(area, 0)} sq ft lawn (${fmt(waste)}% cutting waste).</p>`,
        [
          chip("Sq ft to order", fmt(aw, 0)),
          chip("Rolls (~10 sq ft)", rolls),
          chip("Pallet size", fmt(palletSqft, 0) + " sq ft"),
          chip("With " + waste + "% waste", "included"),
          ...(cost !== null ? [chip("Est. sod cost", "$" + fmt(cost))] : []),
        ]
      );
    },
  };

  function ok(big, chips) {
    return `<div class="result">${big}<div class="breakdown">${chips.join("")}</div></div>`;
  }
  function err(msg) {
    return `<div class="result" style="border-color:var(--danger);background:repeating-linear-gradient(-45deg,rgba(176,67,31,.06) 0 10px,transparent 10px 20px)"><p class="muted" style="margin:0">${msg}</p></div>`;
  }

  function bootCalc(root) {
    const kind = root.dataset.calc;
    const btn = $("calcBtn");
    if (!btn) return;
    let live = false;
    const run = () => {
      document.querySelectorAll(".invalid").forEach((e) => e.classList.remove("invalid"));
      root.querySelector(".calc-out").innerHTML = CALCS[kind]();
      live = true;
    };
    btn.addEventListener("click", run);
    const shapeSel = root.querySelector('select[id$="Shape"]');
    const widthInput = root.querySelector('input[id$="Width"]');
    if (shapeSel && widthInput) {
      const toggle = () => {
        const wrap = widthInput.closest(".field");
        if (wrap) wrap.style.display = shapeSel.value === "circle" ? "none" : "";
      };
      shapeSel.addEventListener("change", toggle);
      toggle();
    }
    root.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter") run();
      });
      el.addEventListener("input", () => {
        el.classList.remove("invalid");
        if (live) run();
      });
    });
  }

  function bootNav() {
    const t = document.querySelector(".nav-toggle");
    const links = document.querySelector(".nav-links");
    if (t && links) t.addEventListener("click", () => links.classList.toggle("open"));
    const here = location.pathname.split("/").pop() || "index.html";
    document.querySelectorAll(".nav-links a").forEach((a) => {
      const href = a.getAttribute("href").split("/").pop();
      if (href === here) a.classList.add("active");
    });
  }

  function bootForm() {
    const form = document.querySelector("form[data-netlify]");
    if (!form) return;
    const status = document.querySelector(".form-status");
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      if (data.get("bot-field")) return;
      status.className = "form-status";
      status.textContent = "Sending…";
      status.classList.add("ok");
      try {
        const res = await fetch("/", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: new URLSearchParams(data).toString(),
        });
        if (!res.ok) throw new Error("bad status");
        status.textContent = "Message sent — we usually reply within two business days.";
        status.className = "form-status ok";
        form.reset();
        setTimeout(() => (location.href = "/thank-you"), 900);
      } catch {
        status.textContent = "Something went wrong. Email us instead at hello@buildingmaterialcalculator.netlify.app.";
        status.className = "form-status err";
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bootNav();
    bootForm();
    document.querySelectorAll("[data-calc]").forEach(bootCalc);
    const y = document.querySelector(".year");
    if (y) y.textContent = new Date().getFullYear();
  });
})();
