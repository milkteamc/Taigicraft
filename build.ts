import { JSZip } from "https://deno.land/x/jszip/mod.ts";

const ver = Deno.args[0];
if (!ver) {
  console.log(
    "No version code provided. Please provide a version code as the first argument."
  );
  Deno.exit(1);
}
console.log(`Building Taigicraft v${ver}...`);

// Load replacements from JSON file
const replacementsData = JSON.parse(await Deno.readTextFile("fix-words.json"));
const replacements = replacementsData.replacements;

// Read the translation file
let file = (await Deno.readTextFile("data/translated.txt")).slice(0, -1);

// Apply all replacements from the JSON file
for (const [from, to] of replacements) {
  file = file.replaceAll(from, to);
}

const outputLines = file.split("\n");
await Deno.writeTextFile(
  `files/dev/${ver}/nan.json`,
  `{${outputLines.join("\n")}}`
);

const zip = new JSZip();
zip
  .folder("assets/minecraft/lang")
  .addFile("nan.json", `{${outputLines.join("\n")}}`);
zip.addFile(
  `pack.mcmeta`,
  `{
  "pack": {
    "pack_format": 55,
    "supported_formats": { "min_inclusive": 1, "max_inclusive": 1000 },
    "description": "§e佇方塊遊戲內底使用臺語。\\n§fby §dCow§aGL §f+ §6MilkTeaMC"
  },
  "language": {
    "nan": {
      "name": "臺灣台語",
      "region": "臺灣",
      "bidirectional": false
    }
  }
}`
);

const output = await zip.generateAsync({
  type: "uint8array",
  compression: "STORE",
  platform: "UNIX",
  compressionOptions: {
    level: 0,
  },
});

await Deno.writeFile(`output/Taigicraft-${ver}.zip`, output);
console.log("Done!");