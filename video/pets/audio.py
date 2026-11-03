# Trilha e efeitos do desenho, sintetizados (sem arquivos externos). Gera audio.wav.
import numpy as np, wave
SR=44100; DUR=49.5; N=int(SR*DUR); mix=np.zeros(N)
rng=np.random.default_rng(1)
def put(sig,t,g=1.0):
    i=int(t*SR); j=min(N,i+len(sig))
    if i<N: mix[i:j]+=sig[:j-i]*g
def env(n,a=0.005,r=0.1):
    t=np.arange(n)/SR; e=np.minimum(1,t/max(a,1e-4))*np.exp(-t/max(r,1e-4)); return e
def tone(f,d,kind='sine',a=0.005,r=0.2,f2=None):
    n=int(d*SR); t=np.arange(n)/SR; fr=np.full(n,f) if f2 is None else np.linspace(f,f2,n); ph=2*np.pi*np.cumsum(fr)/SR
    w={'sine':np.sin(ph),'sq':np.sign(np.sin(ph)),'saw':2*((ph/(2*np.pi))%1)-1,'tri':2*np.abs(2*((ph/(2*np.pi))%1)-1)-1}[kind]; return w*env(n,a,r)
def noise(d,a=0.002,r=0.1,lp=None,hp=None):
    n=int(d*SR); x=rng.standard_normal(n)
    if lp: 
        k=max(1,int(SR/lp/2)); x=np.convolve(x,np.ones(k)/k,'same')
    if hp: k=max(1,int(SR/hp/2)); x=x-np.convolve(x,np.ones(k)/k,'same')
    return x*env(n,a,r)
kick=lambda: tone(120,0.35,'sine',0.001,0.12,40)*1.2
snare=lambda: noise(0.2,0.001,0.07,hp=1500)*0.6+np.pad(tone(190,0.15,'tri',0.001,0.05),(0,int(0.2*SR)-int(0.15*SR)))*0.4
hat=lambda: noise(0.06,0.001,0.02,hp=6000)*0.25
# ---- música ----
BPM=140; B=60/BPM; roots=[82.4,65.4,98.0,73.4]  # E C G D
def section(t0,t1,level):
    s=t0; i=0
    while s<t1-1e-6:
        bar=int((s)/(4*B)); r=roots[bar%4]; beat=i%8
        if level>=1: put(hat(),s,0.8 if beat%2 else 1.0)
        if level>=2:
            if beat in(0,4): put(kick(),s)
            if beat in(2,6): put(snare(),s)
            put(tone(r,B*0.45,'sq',0.003,0.12),s,0.16)
        if level>=3 and beat%4==0:
            for m in(1,1.5,2): put(tone(r*2*m,B*1.8,'saw',0.01,0.5),s,0.05)
        if level==1 and beat==0:
            for m in(1,1.26,1.5): put(tone(r*4*m,B*4,'sine',0.3,1.2),s,0.05)
        s+=B/2; i+=1
section(0,6.5,1); section(6.5,13.5,3); section(13.5,19.5,2); section(19.5,26.5,3); section(26.5,39.5,3); section(39.5,46,1)
# final: acorde grande
for m in(1,1.5,2,2.5,3): put(tone(82.4*m,3.2,'saw',0.005,1.2),46.1,0.07)
put(kick(),46.1,1.4); put(noise(1.5,0.001,0.6,lp=3000),46.1,0.3)
# ---- efeitos ----
def buzz(t,d): n=int(d*SR); tt=np.arange(n)/SR; put(np.sign(np.sin(2*np.pi*150*tt))*(np.sin(2*np.pi*12*tt)>0)*0.18,t)
def ding(t): put(tone(1320,0.4,'sine',0.002,0.25),t,0.3); put(tone(1760,0.5,'sine',0.002,0.3),t+0.09,0.3)
def whoosh(t,d=0.5): put(noise(d,d*0.4,d*0.3,lp=1200)*0.5,t)
def thump(t): put(tone(90,0.4,'sine',0.001,0.15,35),t,1.3); put(noise(0.3,0.001,0.1,lp=800),t,0.6)
def clang(t): [put(tone(f,0.6,'sq',0.001,0.18),t,0.06) for f in(1870,2340,2960)]; put(noise(0.1,0.001,0.03,hp=4000),t,0.4)
def coins(t): [put(tone(2600+rng.random()*1400,0.12,'sine',0.001,0.05),t+i*0.045,0.12) for i in range(14)]
def boing(t): put(tone(180,0.35,'sine',0.002,0.2,620)*np.sin(np.linspace(0,30,int(0.35*SR)))**2,t,0.5)
def pop(t): put(tone(600,0.08,'sine',0.001,0.03,1400),t,0.4)
def gulp(t): put(tone(420,0.35,'sine',0.01,0.2,140),t,0.5)
def pow_(t): thump(t); put(noise(0.35,0.001,0.12,hp=800),t,0.8)
buzz(3.6,0.9); ding(4.55); [pop(5.6+i*0.08) for i in range(3)]
whoosh(6.6); whoosh(8.4); whoosh(9.3,0.3); put(noise(0.08,0.001,0.02,hp=2000),9.3,0.7); whoosh(11.2); thump(12.6)
ding(13.9); pop(15.3); whoosh(16.5,0.35); clang(16.85); coins(16.9); clang(17.1); coins(17.15); clang(17.35); coins(17.4); pop(18.2)
put(noise(0.6,0.3,0.3,lp=600),19.5,0.6); thump(19.6)
for i in range(6): t=20.3+i*0.9; pow_(t); put(tone(300+i*80,0.3,'sq',0.001,0.12),t+0.05,0.08)
gulp(25.8)
put(noise(2.6,0.3,1.5,lp=900),26.5,0.6); [put(tone(1800,0.12,'sq',0.002,0.05,2400),26.9+i*0.7,0.08) for i in range(3)]
whoosh(29.2); pop(29.8); pow_(30.3); put(tone(220,1.0,'sine',0.05,0.6),30.9,0.1)
boing(32.6); boing(32.8); boing(33.0); whoosh(32.9); thump(34.0)
whoosh(34.9); pow_(35.4); [put(tone(1500+i*200,0.1,'sine',0.001,0.04),35.5+i*0.15,0.15) for i in range(4)]
put(tone(200,0.6,'sine',0.2,0.3,320),37.1,0.3); put(noise(1.2,0.08,0.6,lp=700),37.8,1.1); put(noise(1.0,0.05,0.4,hp=200),37.8,0.25); thump(38.2)
buzz(42.0,0.6); ding(42.25); [pop(43.2+i*0.07) for i in range(3)]; whoosh(44.3,0.7); [pop(44.5+i*0.12) for i in range(6)]
pow_(46.1); pop(46.6); pop(47.1)
# fades e normalização
t=np.arange(N)/SR; mix*=np.clip(t/0.4,0,1)*np.clip((DUR-t)/1.2,0,1)
mix=np.tanh(mix*1.4)/np.tanh(1.4); mix/=np.max(np.abs(mix))*1.12
d=(mix*32767).astype(np.int16); w=wave.open('audio.wav','wb'); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR); w.writeframes(d.tobytes()); w.close(); print('ok',len(d)/SR)
