import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {dirname,join} from 'node:path';
const manifest=JSON.parse(await readFile(new URL('./media-manifest.json',import.meta.url),'utf8'));
const base='https://orion-road-to-heart.miskovets.chatgpt.site/';
let cursor=0;
async function copy(){
  while(cursor<manifest.length){
    const item=manifest[cursor++];
    if(!item.file.startsWith('assets/') || item.file.includes('..')) throw new Error('Invalid media path');
    const target=join('dist',item.file);
    try {await access(target);continue;}catch{}
    const response=await fetch(new URL(item.file,base),{signal:AbortSignal.timeout(120000)});
    if(!response.ok)throw new Error(`Download failed: ${item.file} ${response.status}`);
    const bytes=Buffer.from(await response.arrayBuffer());
    if(bytes.length!==item.size||createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw new Error('Integrity check failed: '+item.file);
    await mkdir(dirname(target),{recursive:true});await writeFile(target,bytes);
    console.log('Imported '+item.file);
  }
}
await Promise.all(Array.from({length:4},copy));
console.log('All media available in repository checkout.');
