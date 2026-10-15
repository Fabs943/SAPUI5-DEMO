// Zählt Dateien und Codezeilen beider Apps und gibt eine Vergleichstabelle aus.
// Aufruf: node compare.mjs
import fs from "fs";
import path from "path";

const apps = { "Fiori Elements": "fiori-elements/webapp", "Freestyle": "freestyle/webapp" };

function category(file) {
    if (file.endsWith(".js")) return "JavaScript (Controller, Formatter, Component)";
    if (file.includes("annotations") && file.endsWith(".xml")) return "Annotationen (UI-Beschreibung)";
    if (file.endsWith(".view.xml") || file.endsWith(".fragment.xml")) return "XML-Views & Fragmente";
    if (file.endsWith("manifest.json")) return "manifest.json";
    if (file.endsWith(".properties")) return "i18n-Texte";
    if (file.endsWith(".html")) return "index.html";
    return "Sonstiges";
}

function walk(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
        e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]);
}

// Zeilen ohne Leerzeilen und reine Kommentarzeilen
function countLines(file) {
    return fs.readFileSync(file, "utf8").split("\n").filter((l) => {
        const t = l.trim();
        return t && !t.startsWith("//") && !t.startsWith("*") && !t.startsWith("/*") && !t.startsWith("<!--") && !t.startsWith("#");
    }).length;
}

const result = {};
for (const [name, dir] of Object.entries(apps)) {
    result[name] = { files: 0, lines: 0, cats: {} };
    for (const f of walk(dir)) {
        const c = category(f);
        const n = countLines(f);
        result[name].files++;
        result[name].lines += n;
        result[name].cats[c] ??= { files: 0, lines: 0 };
        result[name].cats[c].files++;
        result[name].cats[c].lines += n;
    }
}

const names = Object.keys(apps);
const cats = [...new Set(names.flatMap((n) => Object.keys(result[n].cats)))].sort();
const cell = (o) => (o ? `${o.files} Datei${o.files === 1 ? "" : "en"} / ${o.lines} Zeilen` : "–");

console.log(`| | ${names.join(" | ")} |`);
console.log(`|---|${names.map(() => "---").join("|")}|`);
for (const c of cats) console.log(`| ${c} | ${names.map((n) => cell(result[n].cats[c])).join(" | ")} |`);
console.log(`| **Gesamt** | ${names.map((n) => `**${cell(result[n])}**`).join(" | ")} |`);
const jsFe = result["Fiori Elements"].cats["JavaScript (Controller, Formatter, Component)"]?.lines ?? 0;
const jsFs = result["Freestyle"].cats["JavaScript (Controller, Formatter, Component)"]?.lines ?? 0;
console.log(`\nEigener JavaScript-Code: Fiori Elements ${jsFe} Zeilen, Freestyle ${jsFs} Zeilen.`);
