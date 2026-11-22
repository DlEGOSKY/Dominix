import { describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import { offlineBuild } from "../../tools/offlineBuild.mjs";
const root=fileURLToPath(new URL("../../",import.meta.url));
function build(html="<html>one</html>",code="console.log(1)"){
  const files={};
  offlineBuild(root).generateBundle.call({emitFile:file=>{files[file.fileName]=file.source;}},{},{
    "index.html":{type:"asset",source:html},"assets/app.js":{type:"chunk",code},
    "assets/collection.js":{type:"chunk",code:"export default 1"},
    "assets/font.woff2":{type:"asset",source:new Uint8Array([1,2,3])},
  });
  return files;
}
describe("offline build revision",()=>{
  it("changes the worker when HTML changes even if bundle filenames stay the same",()=>{
    expect(build("new shell")["sw.js"]).not.toBe(build()["sw.js"]);
  });
  it("is reproducible and accounts for changed executable bytes",()=>{
    expect(build()).toEqual(build());expect(build(undefined,"console.log(2)")["sw.js"]).not.toBe(build()["sw.js"]);
  });
  it("includes lazy chunks and font bytes in the offline asset list",()=>{
    expect(JSON.parse(build()["offline-assets.json"])).toEqual(["assets/app.js","assets/collection.js","assets/font.woff2","index.html"]);
  });
});
