// Local-only old-public -> candidate upgrade harness; never part of dist/.
import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
const root=resolve(process.argv[2]),port=Number(process.argv[3]??5184);
const publicBase='https://dlegosky.github.io/Dominix/';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.json':'application/json','.css':'text/css','.webp':'image/webp','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.txt':'text/plain; charset=utf-8'};
let mode='candidate';const old=new Map();
http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://127.0.0.1');
  if(url.pathname==='/__qa_mode'&&req.method==='POST'){
   let body='';for await(const chunk of req)body+=chunk;
   if(!['public','candidate'].includes(body)){res.writeHead(400).end();return;}
   mode=body;res.writeHead(200,{'Content-Type':'text/plain'}).end(mode);return;
  }
  if(req.method!=='GET'||!url.pathname.startsWith('/Dominix/')){res.writeHead(404).end();return;}
  const file=decodeURIComponent(url.pathname.slice('/Dominix/'.length))||'index.html';
  if(file.includes('..')||file.includes('\\')){res.writeHead(400).end();return;}
  if(mode==='public'){
   if(!old.has(file))old.set(file,(async()=>{const response=await fetch(new URL(file,publicBase));return {status:response.status,type:response.headers.get('content-type')??'application/octet-stream',body:Buffer.from(await response.arrayBuffer())};})());
   const item=await old.get(file);res.writeHead(item.status,{'Content-Type':item.type,'Cache-Control':'no-cache'}).end(item.body);return;
  }
  const path=resolve(root,file);
  if(!path.startsWith(root+sep)){res.writeHead(400).end();return;}
  const body=await readFile(path);res.writeHead(200,{'Content-Type':types[extname(file)]??'application/octet-stream','Cache-Control':'no-cache'}).end(body);
 }catch(error){res.writeHead(error?.code==='ENOENT'?404:502,{'Content-Type':'text/plain'}).end('QA resource unavailable');}
}).listen(port,'127.0.0.1',()=>console.log(`Release QA: http://127.0.0.1:${port}/Dominix/`));
