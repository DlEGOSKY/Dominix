import {readFile,writeFile} from "node:fs/promises";
const {chromium}=await import(process.argv[2]);
const browser=await chromium.launch({executablePath:process.argv[3],headless:true});
try{
  const source=await readFile(new URL("../public/icon.svg",import.meta.url),"utf8");
  const page=await browser.newPage();
  for(const size of [192,512]){
    const data=await page.evaluate(async({source,size})=>{
      const image=new Image();image.src="data:image/svg+xml;base64,"+btoa(source);await image.decode();
      const canvas=document.createElement("canvas");canvas.width=canvas.height=size;
      canvas.getContext("2d").drawImage(image,0,0,size,size);return canvas.toDataURL("image/png").split(",")[1];
    },{source,size});
    await writeFile(new URL(`../public/icon-${size}.png`,import.meta.url),Buffer.from(data,"base64"));
  }
}finally{await browser.close();}
console.log("Exported original Dominix SVG to 192px and 512px installation icons.");
