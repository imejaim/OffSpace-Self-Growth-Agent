"""
Build a single-file HTML force-directed visualization of the Holonomic Brain.

Merges:
- Code nodes and edges from graphify-out/graph.json
- Wiki knowledge nodes from docs/wiki/**/*.md
- Raw source nodes from docs/raw/**/*.md
- Machine memory from .omc/project-memory.json (if present)

Output: graphify-out/holonomic-brain.html
Regenerate with: python scripts/build_brain_viz.py
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
GRAPH_JSON = ROOT / "graphify-out" / "graph.json"
WIKI_DIR = ROOT / "docs" / "wiki"
RAW_DIR = ROOT / "docs" / "raw"
MEMORY_JSON = ROOT / ".omc" / "project-memory.json"
OUT_HTML = ROOT / "graphify-out" / "holonomic-brain.html"


def slug(s: str) -> str:
    return re.sub(r"[^a-z0-9]+", "_", s.lower()).strip("_")


def load_code_layer():
    """Return (nodes, edges) for the code layer from graphify."""
    if not GRAPH_JSON.exists():
        return [], []
    data = json.loads(GRAPH_JSON.read_text(encoding="utf-8"))
    nodes = []
    for n in data.get("nodes", []):
        nid = f"code::{n['id']}"
        nodes.append({
            "id": nid,
            "label": n.get("label", n["id"]),
            "layer": "code",
            "community": n.get("community"),
            "source_file": n.get("source_file"),
            "title": f"{n.get('label','')}\\n{n.get('source_file','')}:{n.get('source_location','')}",
        })
    edges = []
    for e in data.get("links", []) + data.get("edges", []):
        src = e.get("source") or e.get("from")
        tgt = e.get("target") or e.get("to")
        if not src or not tgt:
            continue
        edges.append({
            "source": f"code::{src}",
            "target": f"code::{tgt}",
            "kind": "code",
            "label": e.get("relation") or e.get("label") or "calls",
        })
    return nodes, edges


def iter_markdown(base: Path):
    if not base.exists():
        return
    for p in sorted(base.rglob("*.md")):
        yield p


def front_matter_title(text: str, fallback: str) -> str:
    # Use first H1 if present
    m = re.search(r"^#\s+(.+?)$", text, re.MULTILINE)
    if m:
        return m.group(1).strip()
    return fallback


def load_wiki_layer():
    nodes = []
    edges = []
    for p in iter_markdown(WIKI_DIR):
        rel = p.relative_to(ROOT).as_posix()
        text = p.read_text(encoding="utf-8", errors="ignore")
        title = front_matter_title(text, p.stem)
        category = p.parent.name  # architecture, strategy, incidents, reference, ...
        nid = f"wiki::{slug(rel)}"
        nodes.append({
            "id": nid,
            "label": title,
            "layer": "wiki",
            "category": category,
            "source_file": rel,
            "title": f"{title}\\n{rel}",
        })
        # Inter-wiki links (relative markdown links)
        for href in re.findall(r"\]\((\.{1,2}/[^)\s]+\.md)\)", text):
            try:
                target = (p.parent / href).resolve().relative_to(ROOT).as_posix()
                edges.append({
                    "source": nid,
                    "target": f"wiki::{slug(target)}",
                    "kind": "wiki-link",
                })
            except Exception:
                pass
        # References to raw files
        for href in re.findall(r"docs/raw/[^\s`)\"']+\.md", text):
            edges.append({
                "source": nid,
                "target": f"raw::{slug(href)}",
                "kind": "wiki-raw",
            })
        # References to intercept code
        for href in re.findall(r"intercept[\\/][\w\\/.-]+\.(?:ts|tsx|js|toml|md)", text):
            edges.append({
                "source": nid,
                "target": f"code_source::{slug(href.replace('\\\\','/'))}",
                "kind": "wiki-code",
            })
    return nodes, edges


def load_raw_layer():
    nodes = []
    for p in iter_markdown(RAW_DIR):
        rel = p.relative_to(ROOT).as_posix()
        text = p.read_text(encoding="utf-8", errors="ignore")
        title = front_matter_title(text, p.stem)
        nid = f"raw::{slug(rel)}"
        nodes.append({
            "id": nid,
            "label": title,
            "layer": "raw",
            "source_file": rel,
            "title": f"{title}\\n{rel}",
        })
    return nodes


def load_memory_layer():
    if not MEMORY_JSON.exists():
        return [], []
    try:
        data = json.loads(MEMORY_JSON.read_text(encoding="utf-8"))
    except Exception:
        return [], []
    nodes = []
    edges = []
    root_id = "memory::_root"
    nodes.append({
        "id": root_id,
        "label": "project-memory.json",
        "layer": "memory",
        "source_file": MEMORY_JSON.relative_to(ROOT).as_posix(),
        "title": "Machine memory root",
    })
    if isinstance(data, dict):
        for k in data.keys():
            nid = f"memory::{slug(str(k))}"
            nodes.append({
                "id": nid,
                "label": str(k),
                "layer": "memory",
                "source_file": MEMORY_JSON.relative_to(ROOT).as_posix(),
                "title": f"memory/{k}",
            })
            edges.append({"source": root_id, "target": nid, "kind": "memory"})
    return nodes, edges


def main():
    code_nodes, code_edges = load_code_layer()
    wiki_nodes, wiki_edges = load_wiki_layer()
    raw_nodes = load_raw_layer()
    mem_nodes, mem_edges = load_memory_layer()

    # Drop wiki->code edges that point at nonexistent code-source nodes —
    # we'll instead link wiki nodes to code nodes whose source_file matches.
    code_by_source: dict[str, list[str]] = {}
    for n in code_nodes:
        sf = (n.get("source_file") or "").replace("\\", "/")
        code_by_source.setdefault(sf, []).append(n["id"])

    resolved_wiki_code_edges = []
    for e in wiki_edges:
        if e["kind"] != "wiki-code":
            resolved_wiki_code_edges.append(e)
            continue
        # Walk all code nodes whose source_file ends with the referenced path
        referenced = e["target"].replace("code_source::", "").replace("_", "/")
        # match by loose substring
        hits: list[str] = []
        for sf, ids in code_by_source.items():
            if referenced.split("/")[-1].split(".")[0] in sf.lower():
                hits.extend(ids)
        for h in hits[:3]:  # cap to avoid edge explosion
            resolved_wiki_code_edges.append({
                "source": e["source"],
                "target": h,
                "kind": "wiki-code",
            })

    all_nodes = code_nodes + wiki_nodes + raw_nodes + mem_nodes
    all_edges = code_edges + resolved_wiki_code_edges + mem_edges

    # Deduplicate edges
    seen = set()
    dedup = []
    for e in all_edges:
        key = (e["source"], e["target"], e.get("kind"))
        if key in seen:
            continue
        seen.add(key)
        dedup.append(e)

    # Drop edges that reference missing nodes
    node_ids = {n["id"] for n in all_nodes}
    dedup = [e for e in dedup if e["source"] in node_ids and e["target"] in node_ids]

    html = build_html(all_nodes, dedup)
    OUT_HTML.parent.mkdir(parents=True, exist_ok=True)
    OUT_HTML.write_text(html, encoding="utf-8")
    print(f"[brain-viz] nodes={len(all_nodes)} edges={len(dedup)} -> {OUT_HTML}")


def build_html(nodes, edges) -> str:
    data = {"nodes": nodes, "edges": edges}
    payload = json.dumps(data, ensure_ascii=False)
    return HTML_TEMPLATE.replace("__DATA__", payload)


HTML_TEMPLATE = r"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>Intercept — Holonomic Brain</title>
<style>
  :root {
    --bg: #0a0a0f;
    --panel: rgba(15, 15, 25, 0.86);
    --ink: #e8e8f0;
    --muted: #8b8ba0;
    --accent: #f59e0b;
    --code: #60a5fa;
    --wiki: #34d399;
    --raw:  #f472b6;
    --memory: #fbbf24;
  }
  html, body { margin: 0; height: 100%; background: radial-gradient(ellipse at top, #12121c 0%, #05050a 100%); color: var(--ink); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif; overflow: hidden; }
  #chart { position: absolute; inset: 0; }
  .panel { position: absolute; top: 16px; left: 16px; background: var(--panel); backdrop-filter: blur(10px); padding: 14px 16px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); max-width: 340px; font-size: 12px; line-height: 1.5; }
  .panel h1 { font-size: 13px; margin: 0 0 6px 0; letter-spacing: 0.04em; text-transform: uppercase; color: var(--accent); }
  .panel .sub { color: var(--muted); font-size: 11px; margin-bottom: 10px; }
  .legend { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 12px; margin-top: 8px; }
  .legend div { display: flex; align-items: center; gap: 6px; color: var(--muted); font-size: 11px; }
  .legend .dot { width: 10px; height: 10px; border-radius: 50%; }
  .hint { color: var(--muted); font-size: 10px; margin-top: 10px; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px; }
  #tooltip { position: absolute; pointer-events: none; background: rgba(5,5,10,0.94); border: 1px solid rgba(255,255,255,0.15); padding: 8px 10px; border-radius: 6px; font-size: 11px; line-height: 1.45; color: var(--ink); max-width: 320px; white-space: pre-wrap; display: none; z-index: 10; }
  .counts { margin-top: 10px; color: var(--ink); font-size: 11px; }
  .counts span { display: inline-block; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.05); margin-right: 4px; }
  .controls { position: absolute; top: 16px; right: 16px; background: var(--panel); padding: 10px 12px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.08); font-size: 11px; display: flex; gap: 10px; align-items: center; }
  .controls label { color: var(--muted); }
  .controls input[type="checkbox"] { accent-color: var(--accent); }
</style>
</head>
<body>
<div id="chart"></div>
<div class="panel">
  <h1>Intercept · Holonomic Brain</h1>
  <div class="sub">Force-directed map of the shared project brain. Drag nodes. Hover for detail.</div>
  <div class="legend">
    <div><span class="dot" style="background: var(--code)"></span>code (graphify)</div>
    <div><span class="dot" style="background: var(--wiki)"></span>wiki (curated)</div>
    <div><span class="dot" style="background: var(--raw)"></span>raw (source)</div>
    <div><span class="dot" style="background: var(--memory)"></span>machine memory</div>
  </div>
  <div class="counts" id="counts"></div>
  <div class="hint">scroll = zoom · drag = pan · drag node = reposition · click node = pin/unpin</div>
</div>
<div class="controls">
  <label><input type="checkbox" id="toggle-code" checked /> code</label>
  <label><input type="checkbox" id="toggle-wiki" checked /> wiki</label>
  <label><input type="checkbox" id="toggle-raw" checked /> raw</label>
  <label><input type="checkbox" id="toggle-memory" checked /> memory</label>
</div>
<div id="tooltip"></div>
<script src="https://cdn.jsdelivr.net/npm/d3@7/dist/d3.min.js"></script>
<script>
const DATA = __DATA__;

const width = window.innerWidth;
const height = window.innerHeight;

const COLOR = {
  code: "#60a5fa",
  wiki: "#34d399",
  raw: "#f472b6",
  memory: "#fbbf24",
};

const svg = d3.select("#chart").append("svg")
  .attr("width", width)
  .attr("height", height);

const g = svg.append("g");

svg.call(d3.zoom().scaleExtent([0.1, 8]).on("zoom", (ev) => {
  g.attr("transform", ev.transform);
}));

const nodes = DATA.nodes.map(d => Object.assign({}, d));
const nodeById = new Map(nodes.map(n => [n.id, n]));
const links = DATA.edges
  .map(e => ({ source: nodeById.get(e.source), target: nodeById.get(e.target), kind: e.kind }))
  .filter(l => l.source && l.target);

document.getElementById("counts").innerHTML = `
  <span>nodes ${nodes.length}</span>
  <span>edges ${links.length}</span>
  <span>layers ${new Set(nodes.map(n=>n.layer)).size}</span>
`;

const link = g.append("g")
  .attr("stroke-opacity", 0.75)
  .selectAll("line")
  .data(links)
  .join("line")
  .attr("stroke-width", d => {
    if (d.kind === "wiki-link") return 1.8;
    if (d.kind === "wiki-raw" || d.kind === "wiki-code") return 1.6;
    if (d.kind === "memory") return 1.4;
    return 1.1;
  })
  .attr("stroke", d => {
    if (d.kind === "wiki-link") return "#6ee7b7";
    if (d.kind === "wiki-raw") return "#f9a8d4";
    if (d.kind === "wiki-code") return "#fcd34d";
    if (d.kind === "memory") return "#fcd34d";
    return "#93c5fd";
  });

const simulation = d3.forceSimulation(nodes)
  .force("link", d3.forceLink(links).distance(l => l.kind === "code" ? 28 : 55).strength(0.35))
  .force("charge", d3.forceManyBody().strength(d => d.layer === "code" ? -18 : -60))
  .force("center", d3.forceCenter(width / 2, height / 2))
  .force("collide", d3.forceCollide().radius(d => d.layer === "code" ? 5 : 10));

const node = g.append("g")
  .selectAll("circle")
  .data(nodes)
  .join("circle")
  .attr("r", d => {
    if (d.layer === "wiki") return 6;
    if (d.layer === "raw") return 5;
    if (d.layer === "memory") return 5;
    return 3.2;
  })
  .attr("fill", d => COLOR[d.layer] || "#94a3b8")
  .attr("stroke", "#0a0a0f")
  .attr("stroke-width", 0.7)
  .call(drag(simulation));

const label = g.append("g")
  .selectAll("text")
  .data(nodes.filter(n => n.layer !== "code"))
  .join("text")
  .text(d => d.label.length > 32 ? d.label.slice(0, 30) + "…" : d.label)
  .attr("font-size", 9.5)
  .attr("font-family", "-apple-system, BlinkMacSystemFont, sans-serif")
  .attr("fill", "#e8e8f0")
  .attr("stroke", "#0a0a0f")
  .attr("stroke-width", 2.5)
  .attr("paint-order", "stroke fill")
  .attr("pointer-events", "none");

const tooltip = document.getElementById("tooltip");
node.on("mousemove", (ev, d) => {
  tooltip.style.display = "block";
  tooltip.style.left = (ev.pageX + 12) + "px";
  tooltip.style.top = (ev.pageY + 12) + "px";
  tooltip.textContent = `${d.label}\n${d.source_file || ""}`.trim();
}).on("mouseleave", () => {
  tooltip.style.display = "none";
}).on("click", (ev, d) => {
  d.fx = d.fx === null || d.fx === undefined ? d.x : null;
  d.fy = d.fy === null || d.fy === undefined ? d.y : null;
});

simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
    node.attr("cx", d => d.x).attr("cy", d => d.y);
    label.attr("x", d => d.x + 8).attr("y", d => d.y + 3);
  });

function drag(sim) {
  return d3.drag()
    .on("start", (ev, d) => {
      if (!ev.active) sim.alphaTarget(0.3).restart();
      d.fx = d.x; d.fy = d.y;
    })
    .on("drag", (ev, d) => { d.fx = ev.x; d.fy = ev.y; })
    .on("end", (ev, d) => {
      if (!ev.active) sim.alphaTarget(0);
    });
}

function applyToggles() {
  const show = {
    code: document.getElementById("toggle-code").checked,
    wiki: document.getElementById("toggle-wiki").checked,
    raw: document.getElementById("toggle-raw").checked,
    memory: document.getElementById("toggle-memory").checked,
  };
  node.style("display", d => show[d.layer] ? null : "none");
  label.style("display", d => show[d.layer] ? null : "none");
  link.style("display", d => (show[d.source.layer] && show[d.target.layer]) ? null : "none");
}
["toggle-code","toggle-wiki","toggle-raw","toggle-memory"].forEach(id => {
  document.getElementById(id).addEventListener("change", applyToggles);
});

window.addEventListener("resize", () => {
  svg.attr("width", window.innerWidth).attr("height", window.innerHeight);
  simulation.force("center", d3.forceCenter(window.innerWidth / 2, window.innerHeight / 2));
  simulation.alpha(0.3).restart();
});
</script>
</body>
</html>
"""


if __name__ == "__main__":
    main()
