import fs from "fs";

const path = "src/lib/i18n/dictionaries.ts";
let s = fs.readFileSync(path, "utf8");
if (s.charCodeAt(0) === 0xfeff) s = s.slice(1);

s = s.replace("} as const;\n\nconst fr", "}\n\nconst fr");
s = s.replace("} as const;\r\n\r\nconst fr", "}\n\nconst fr");

const fixes = [
  ["ParamÃ¨tres", "Paramètres"],
  ["propulsÃ©e", "propulsée"],
  ["mÃ©tÃ©o", "météo"],
  ["classÃ©s", "classés"],
  ["arrÃªter", "arrêter"],
  ["ConÃ§u", "Conçu"],
  ["mÃ©thode", "méthode"],
  ["sÃ©curisÃ©e", "sécurisée"],
  ["dÃ©bloquez", "débloquez"],
  ["CrÃ©er", "Créer"],
  ["marchÃ©s", "marchés"],
  ["structurÃ©s", "structurés"],
  ["estimÃ©", "estimé"],
  ["unitÃ©s", "unités"],
  ["sÃ©lectionnÃ©es", "sélectionnées"],
  ["unitÃ©", "unité"],
  ["gÃ©rer", "gérer"],
  ["dÃ©veloppeur", "développeur"],
  ["GoÃ»tez", "Goûtez"],
  ["limitÃ©", "limité"],
  ["RÃ©sumÃ©", "Résumé"],
  ["rÃ©ussite", "réussite"],
  ["illimitÃ©s", "illimités"],
  ["Passer Ã ", "Passer à"],
  ["DÃ©blocages", "Déblocages"],
  ["avancÃ©", "avancé"],
  ["CrÃ©ation", "Création"],
  ["DÃ©jÃ ", "Déjà"],
  ["Ã‰chec", "Échec"],
  ["dÃ©blocages", "déblocages"],
  ["rÃ©cent", "récent"],
  ["fenÃªtre", "fenêtre"],
  ["notÃ©s", "notés"],
  ["dÃ©mo", "démo"],
  ["rÃ©sumÃ©", "résumé"],
  ["Ã€ titre", "À titre"],
  ["Ã©ducatif", "éducatif"],
  ["DÃ©tails", "Détails"],
  ["complÃ¨tes", "complètes"],
  ["DÃ©connexion", "Déconnexion"],
  ["GÃ©rer", "Gérer"],
  ["ClÃ©s", "Clés"],
  ["InstantanÃ©", "Instantané"],
  ["stockÃ©s", "stockés"],
  ["AmÃ©liorer", "Améliorer"],
  ["Ã©carts", "écarts"],
  ["amÃ©ricaines", "américaines"],
  ["crÃ©er", "créer"],
  ["Ã  ", "à "],
  ["Ã€ ", "À "],
  ["â€”", "—"],
  ["â€¦", "…"],
  ["Â·", "·"],
  ["â†’", "→"],
];

for (const [a, b] of fixes) {
  s = s.split(a).join(b);
}

fs.writeFileSync(path, s, "utf8");
console.log("ok", !s.includes("as const"), !s.includes("Ã"));
