// node render.js frames 1,5.2,...  -> PNGs de conferência
// node render.js video saida.mp4   -> todos os quadros em MP4 (sem áudio)
const {chromium}=require('playwright');const {spawn}=require('child_process');const path=require('path');
(async()=>{const [mode,arg]=process.argv.slice(2);const b=await chromium.launch();const p=await b.newPage({viewport:{width:1280,height:720}});
  const errs=[];p.on('pageerror',e=>errs.push(e.message));await p.goto('file://'+path.join(__dirname,'cartoon.html'));await p.waitForTimeout(800);
  if(mode==='frames'){for(const t of arg.split(',').map(Number)){await p.evaluate(t=>seek(t),t);await p.screenshot({path:path.join(process.argv[4]||'.',`f_${t}.png`)});}}
  else{const dur=await p.evaluate(()=>DUR),fps=30,n=Math.round(dur*fps);
    const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',String(fps),'-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','20','-preset','medium',arg],{stdio:['pipe','inherit','inherit']});
    const t0=Date.now();for(let i=0;i<n;i++){await p.evaluate(t=>seek(t),i/fps);const buf=await p.screenshot({type:'jpeg',quality:92});if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));
      if(i%150===0)console.log(`quadro ${i}/${n} · ${((Date.now()-t0)/1000).toFixed(0)}s`);}
    ff.stdin.end();await new Promise(r=>ff.on('close',r));}
  console.log(errs.length?errs:'sem erros');await b.close();})();
