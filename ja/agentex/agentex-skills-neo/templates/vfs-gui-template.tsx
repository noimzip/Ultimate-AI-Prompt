import { useState, useRef, useEffect } from 'react';

// --- VFS DATA STRUCTURE ---
// AI(Gemini)が正確にスキーマを解釈できるよう、型定義と初期値のみ改行・構造化しています
export type VFSNode = 
  | { type: 'dir'; children: Record<string, VFSNode> }
  | { type: 'file'; content: string };

const INIT_VFS: Record<string, VFSNode> = {
  skills: { type: 'dir', children: {} },
  plans:  { type: 'dir', children: {} },
  drive:  { type: 'dir', children: {} }
};
// --------------------------

export default function App(){
let[h,H]=useState<string[]>([]),[v,V]=useState(INIT_VFS),[p,P]=useState('/'),[i,I]=useState(''),[e,E]=useState<any>(0),[m,M]=useState(0),R=useRef<any>(0);
useEffect(()=>{R.current?.scrollIntoView()},[h]);
let f=(q='',g=v):any=>{let b:string[]=[],a=q[0]=='/'?q:p+'/'+q;a.split('/').filter(Boolean).map(x=>x=='..'?b.pop():x!='.'&&b.push(x));let n:any={children:g};b.map(x=>n=n?.children?.[x]);return{n,a:'/'+b.join('/'),p:'/'+b.slice(0,-1).join('/'),N:b[b.length-1]||''}};
let U=(C:any)=>V(d=>{let n=structuredClone(d);C(n);return n}),S=()=>{U((r:any)=>{let F=f(e.p,r),N=F.n;N?N.content=e.v:f(F.p,r).n.children[F.N]={type:'file',content:e.v}});E(0)};
if(e)return<div className="absolute inset-0 bg-black p-2 text-white font-mono text-xs flex flex-col z-10"><div className="flex gap-4 mb-2">{e.p} <u className="cursor-pointer" onClick={S}>save</u><u className="cursor-pointer" onClick={()=>E(0)}>close</u></div><textarea autoFocus className="flex-1 bg-neutral-900 p-2 outline-none text-white whitespace-pre-wrap" value={e.v} onChange={z=>E({...e,v:z.target.value})} onKeyDown={z=>{if(z.key=='s'&&(z.ctrlKey||z.metaKey)){z.preventDefault();S()}if(z.key=='Escape')E(0)}}/></div>;
return<div className="absolute inset-0 bg-black text-white font-mono text-xs overflow-auto pb-12 p-2">{h.map((l,j)=><div key={j} className="mb-1">{l}</div>)}<div ref={R}/><div className="fixed bottom-0 left-0 w-full bg-black p-2 flex gap-2 items-center"><span>{p} $</span><input autoFocus className="bg-transparent outline-none flex-1 text-white" value={i} onChange={z=>I(z.target.value)} onKeyDown={z=>{if(z.key=='Enter'&&i.trim()){let[c,a,d]=i.trim().split(/\s+/),o:any='',{n,a:A,p:pp,N}=f(a||p);if(c=='ls')o=n?.children?Object.keys(n.children).map(k=>n.children[k].children?'/'+k:k).join(' '):'err';else if(c=='cd')n?.children?P(A):o='err';else if(c=='cat')o=n?.content!=null?n.content:'err';else if(c=='touch'||c=='mkdir')a?U((r:any)=>{let m=f(pp,r).n;m&&(m.children[N]=c=='touch'?{type:'file',content:''}:{type:'dir',children:{}})}):o='err';else if(c=='rm')a?U((r:any)=>{let m=f(pp,r).n;m&&delete m.children[N]}):o='err';else if(c=='mv'||c=='cp')a&&d?U((r:any)=>{let A_=f(a,r),D=f(d,r),s=A_.n,T=D.n?.children?D.n:f(D.p,r).n,N_=D.n?.children?A_.N:D.N;if(s&&T?.children&&!(c=='mv'&&A_.a==(D.n?.children?D.a+'/'+A_.N:D.a))){T.children[N_]=structuredClone(s);c=='mv'&&delete f(A_.p,r).n.children[A_.N]}}):o='err';else if(c=='vi')a?E({p:A,v:n?.content||''}):o='err';else o='ls cd cat touch mkdir mv cp rm vi';H([...h,`${p} $ ${i}`,o].filter(Boolean));I('')}}}/><u className="cursor-pointer" onClick={()=>M(1)}>save</u></div>{m?<div className="fixed inset-0 bg-black/80 flex flex-col p-4 z-50"><div className="flex justify-end mb-2"><u className="cursor-pointer text-white" onClick={()=>M(0)}>close</u></div><textarea readOnly className="flex-1 bg-neutral-900 border border-white/20 text-white/90 p-4 font-mono text-[10px] outline-none whitespace-pre-wrap" value={`CMD: ls cd cat touch mkdir rm mv cp vi\nVFS:\n${JSON.stringify(v,null,2)}\nPath: ${p}`}/></div>:null}</div>}