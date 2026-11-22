// Read-only regression of the current clipboard helper, using its actual source.
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir,stat} from 'node:fs/promises';
import ts from 'typescript';
const output=process.argv[2];await mkdir(output,{recursive:true});
const source=await readFile('src/engine/clipboard.ts','utf8');
const js=ts.transpileModule(source,{fileName:'clipboard.ts',compilerOptions:{target:ts.ScriptTarget.ES2020,module:ts.ModuleKind.CommonJS}}).outputText;
const evaluate=async navigator=>{const exports={};new Function('navigator','exports',js)(navigator,exports);return exports.copyText('Dominix QA');};
const missing=await evaluate({});
const denied=await evaluate({clipboard:{writeText:()=>Promise.reject(new Error('NotAllowedError: audit'))}});
const accepted=await evaluate({clipboard:{writeText:()=>Promise.resolve()}});
assert.equal(missing,false);assert.equal(denied,false);assert.equal(accepted,true);
const materials=['ivory','emerald','ruby','diamond','obsidian','roman'];
const sizes=Object.fromEntries(await Promise.all(materials.map(async name=>[name,(await stat(`src/assets/materials/${name}-v1.webp`)).size])));
const report={
 scope:'Isolated execution of the production clipboard function; not a browser permission reproduction. Supersedes the 15 November diagnosis.',
 sharing:{missingClipboardReportsSuccess:missing,rejectedClipboardReportsSuccess:denied,acknowledgedCopyReportsSuccess:accepted},
 materialTextureBytes:sizes,totalMaterialTextureBytes:Object.values(sizes).reduce((sum,n)=>sum+n,0),
 auditWritesProductFiles:false,
};
await writeFile(`${output}/review-evidence.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
