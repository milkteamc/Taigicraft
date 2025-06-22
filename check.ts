const ver = Deno.args[0];
if (!ver) {
  console.log(
    "No version code provided. Please provide a version code as the first argument."
  );
  Deno.exit(1);
}

let file = await Deno.readTextFile(`files/dev/${ver}/nan.json`);
let matches = [...file.matchAll(/^.*([^a-zA-Z0-9": .])\1{1,}.*$/gm)].map((a) => `${a[0]}\n`);
console.log(...matches);
