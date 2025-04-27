import { JSZip } from "https://deno.land/x/jszip/mod.ts";

const ver = Deno.args[0];
if (!ver) {
  console.log(
    "No version code provided. Please provide a version code as the first argument."
  );
  Deno.exit(1);
}
console.log(`Building Taigicraft v${ver}...`);
const zip = new JSZip();
const file = (await Deno.readTextFile("data/translated.txt"))
  .slice(0, -1)
  .replaceAll("侍服器", "伺服器")
  .replaceAll("耍厝", "玩家")
  .replaceAll("% s", "%s")
  .replaceAll("% %", "%%")
  .replaceAll("% 一 $ s", "%1$s")
  .replaceAll("% 二 $ s", "%2$s")
  .replaceAll("% 三 $ s", "%3$s")
  .replaceAll("% 四 $ s", "%4$s")
  .replaceAll("% 五 $ s", "%5$s")
  .replaceAll("% 六 $ s", "%6$s")
  .replaceAll("% 七 $ s", "%7$s");
const outputLines = file.split("\n");
await Deno.writeTextFile(
  `files/dev/${ver}/nan.json`,
  `{${outputLines.join("\n")}}`
);
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
      "name": "台語",
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
await Deno.writeFile(`output/Taigicraft ${ver}.zip`, output);
console.log("Done!");
