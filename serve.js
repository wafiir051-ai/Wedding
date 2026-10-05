// Server statis sederhana untuk preview lokal: `npm start` → http://localhost:3000
// (Untuk produksi cukup upload folder /public ke hosting statis apa pun.)
const http=require('http'),fs=require('fs'),path=require('path');
const ROOT=path.join(__dirname,'public'),PORT=process.env.PORT||3000;
const M={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.jpg':'image/jpeg','.png':'image/png','.mp3':'audio/mpeg','.svg':'image/svg+xml'};
http.createServer((q,r)=>{
  let p=decodeURIComponent(new URL(q.url,'http://x').pathname);
  if(p==='/admin'||p==='/admin/')p='/admin.html'; if(p.endsWith('/'))p+='index.html';
  const f=path.normalize(path.join(ROOT,p));
  if(!f.startsWith(ROOT+path.sep))return r.writeHead(403).end();
  fs.stat(f,(e,st)=>{
    if(e||!st.isFile())return r.writeHead(404).end('Not found');
    const h={'Content-Type':M[path.extname(f)]||'application/octet-stream','Accept-Ranges':'bytes','Cache-Control':'no-cache'};
    const m=/^bytes=(\d*)-(\d*)$/.exec(q.headers.range||'');
    if(m){const s=+m[1]||0,e2=m[2]?+m[2]:st.size-1;r.writeHead(206,{...h,'Content-Range':`bytes ${s}-${e2}/${st.size}`,'Content-Length':e2-s+1});return fs.createReadStream(f,{start:s,end:e2}).pipe(r);}
    r.writeHead(200,{...h,'Content-Length':st.size});fs.createReadStream(f).pipe(r);
  });
}).listen(PORT,()=>console.log('http://localhost:'+PORT));
