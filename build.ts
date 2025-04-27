const file = (await Deno.readTextFile("data/translated.txt"))
  .slice(0, -1)
  .replaceAll("侍服器", "伺服器")
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
await Deno.writeTextFile("output/nan.json", `{${outputLines.join("\n")}}`);
await Deno.writeTextFile(`files/dev/${Deno.args[0]}/nan.json`, `{${outputLines.join("\n")}}`);