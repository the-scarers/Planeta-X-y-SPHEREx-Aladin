/* Planeta X y SPHEREx — lógica de la página.
   Estrellas del hero, barra de progreso, visor con zoom y filtros,
   comparador, coordenadas con SkyView en vivo, galería, FAQ y el
   editor que descarga la página editada. Lee su configuración de
   window.CONFIG (assets/js/config.js). */

  /* Imágenes incrustadas: cada <img data-imagen="nombre"> toma su
     imagen de window.IMAGES (assets/js/images.js). Antes el src
     venía escrito en el HTML, repetido en cada aparición. */
  document.querySelectorAll("img[data-imagen]").forEach(function(im){
    var img = window.IMAGES && window.IMAGES[im.getAttribute("data-imagen")];
    if(img) im.src = img;
  });

(function(){
  "use strict";
  var C = window.CONFIG || {};
  function $(id){ return document.getElementById(id); }
  function toast(msg){ var t=$("toast"); t.textContent=msg; t.classList.add("show"); setTimeout(function(){ t.classList.remove("show"); }, 3200); }

  document.querySelectorAll("[data-cfg]").forEach(function(el){ var k=el.getAttribute("data-cfg"); if(C[k]) el.textContent=C[k]; });
  function setMail(){ var mb=$("mailBtn"), mt=$("mailText"); if(mb) mb.href="mailto:"+C.correoContacto; if(mt){ mt.href="mailto:"+C.correoContacto; mt.textContent=C.correoContacto; } }
  setMail();
  function setIrsa(){ ["navIrsa","heroIrsa","sideIrsa"].forEach(function(id){ var a=$(id); if(a) a.href="#irsa"; }); var ex=$("irsaExplorerLink"); if(ex) ex.href=C.irsaExplorer; var ar=$("irsaArchivoLink"); if(ar) ar.href=C.irsaArchivo; var g=$("irsaGuiaLink"); if(g) g.href=C.irsaGuia; }
  setIrsa();

  /* Contadores desde el lanzamiento */
  (function(){
    var launch = new Date("2025-03-11T00:00:00Z");
    var days = Math.max(0, Math.floor((Date.now()-launch.getTime())/86400000));
    var dEl=$("diasDesde"), oEl=$("orbitasEst");
    if(dEl) dEl.textContent = days.toLocaleString("es");
    if(oEl) oEl.textContent = Math.round(days*14.5).toLocaleString("es");
  })();

  /* Barra de progreso */
  window.addEventListener("scroll", function(){
    var h=document.documentElement; var max=h.scrollHeight-h.clientHeight;
    $("progressBar").style.width = (max>0 ? (h.scrollTop/max)*100 : 0) + "%";
  }, {passive:true});

  /* Estrellas */
  var cv=$("stars");
  if(cv && !window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    var ctx=cv.getContext("2d"), W,H,stars=[];
    function size(){ W=cv.width=cv.offsetWidth; H=cv.height=cv.offsetHeight; stars=[]; for(var i=0;i<130;i++) stars.push({x:Math.random()*W,y:Math.random()*H,r:Math.random()*1.3+0.3,p:Math.random()*Math.PI*2}); }
    size(); window.addEventListener("resize", size);
    (function draw(t){ ctx.clearRect(0,0,W,H); stars.forEach(function(s){ var a=0.35+0.55*Math.abs(Math.sin(t/1400+s.p)); ctx.globalAlpha=a; ctx.fillStyle="#dfe7ff"; ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,7); ctx.fill(); }); ctx.globalAlpha=1; requestAnimationFrame(draw); })(0);
  }

  /* Dato curioso */
  var datoIdx=-1;
  $("datoBtn").addEventListener("click", function(){
    var list=C.datosCuriosos||[]; if(!list.length) return;
    var n; do{ n=Math.floor(Math.random()*list.length); }while(n===datoIdx && list.length>1);
    datoIdx=n; $("datoOut").textContent=list[n];
  });

  /* ===== VISOR ===== */
  var imgs=C.imagenesVisor||[];
  var stageImg=$("stageImg"), stageView=$("stageView"), sideTitle=$("sideTitle"), sideDate=$("sideDate"), sideDesc=$("sideDesc"), sideCredit=$("sideCredit"), thumbs=$("thumbs");
  var current=0, zoom=1, panX=0, panY=0, playTimer=null, tlIdx=0;
  var zoomRange=$("zoom"), zoomVal=$("zoomOutVal"), waveRange=$("wave"), waveVal=$("waveVal");
  function applyTransform(){ stageImg.style.transform="scale("+zoom+") translate("+panX+"px,"+panY+"px)"; }
  function setZoom(z){ zoom=Math.min(2.8,Math.max(1,z)); if(zoom===1){panX=0;panY=0;} zoomRange.value=Math.round(zoom*100); zoomVal.textContent=Math.round(zoom*100)+"%"; applyTransform(); }
  zoomRange.addEventListener("input", function(){ setZoom(this.value/100); });
  $("zoomIn").addEventListener("click", function(){ setZoom(zoom+0.25); });
  $("zoomOut").addEventListener("click", function(){ setZoom(zoom-0.25); });
  function applyWave(){
    var v=Number(waveRange.value);
    document.querySelectorAll("#waveChips .chip").forEach(function(ch){ ch.classList.toggle("on", Number(ch.getAttribute("data-wave"))===v); });
    if(v===0){ stageImg.style.filter=""; waveVal.textContent="Original"; return; }
    var um=(0.75+(v/100)*4.25).toFixed(2).replace(".",",");
    stageImg.style.filter="hue-rotate("+(v*1.1)+"deg) saturate("+(1+v/130)+") brightness("+(1+v/500)+")";
    waveVal.textContent="≈ "+um+" µm";
  }
  waveRange.addEventListener("input", applyWave);
  document.querySelectorAll("#waveChips .chip").forEach(function(ch){ ch.addEventListener("click", function(){ waveRange.value=ch.getAttribute("data-wave"); applyWave(); }); });
  var dragging=false,sx=0,sy=0,spx=0,spy=0;
  stageView.addEventListener("pointerdown", function(e){ if(zoom<=1) return; dragging=true; sx=e.clientX; sy=e.clientY; spx=panX; spy=panY; stageView.setPointerCapture(e.pointerId); });
  stageView.addEventListener("pointermove", function(e){ if(!dragging) return; panX=spx+(e.clientX-sx)/zoom; panY=spy+(e.clientY-sy)/zoom; applyTransform(); });
  ["pointerup","pointercancel"].forEach(function(ev){ stageView.addEventListener(ev, function(){ dragging=false; }); });
  stageView.addEventListener("dblclick", function(){ setZoom(zoom>1?1:1.8); });
  function selectImage(i, note){
    if(!imgs[i]) return; current=i; var d=imgs[i];
    stageImg.src=d.src; stageImg.alt=d.alt; sideTitle.textContent=d.titulo; sideDate.textContent=d.fecha; sideDesc.textContent=d.descripcion; sideCredit.textContent=d.credito;
    setZoom(1); waveRange.value=0; applyWave();
    thumbs.querySelectorAll(".thumb").forEach(function(t,j){ t.classList.toggle("on", j===i); });
    if(note) $("tlNote").textContent=note;
  }
  imgs.forEach(function(d,i){
    var b=document.createElement("button"); b.className="thumb"+(i===0?" on":""); b.setAttribute("aria-label","Ver en el visor: "+d.titulo);
    var im=document.createElement("img"); im.src=d.src; im.alt=""; b.appendChild(im);
    b.addEventListener("click", function(){ stopPlay(); document.querySelectorAll(".tl-btn").forEach(function(x){x.classList.remove("on");}); selectImage(i, d.titulo+" — "+d.fecha+". "+d.descripcion); });
    thumbs.appendChild(b);
  });
  var tl=$("timeline");
  (C.lineaDeTiempo||[]).forEach(function(ev,i){
    var b=document.createElement("button"); b.className="tl-btn"+(i===0?" on":""); b.textContent=ev.etiqueta;
    b.addEventListener("click", function(){ stopPlay(); tlIdx=i; tl.querySelectorAll(".tl-btn").forEach(function(x){x.classList.remove("on");}); b.classList.add("on"); selectImage(ev.imagen, ev.nota); });
    tl.appendChild(b);
  });
  function stepTimeline(){
    var evs=C.lineaDeTiempo||[]; if(!evs.length) return;
    tlIdx=(tlIdx+1)%evs.length;
    tl.querySelectorAll(".tl-btn").forEach(function(x,j){ x.classList.toggle("on", j===tlIdx); });
    selectImage(evs[tlIdx].imagen, evs[tlIdx].nota);
  }
  function stopPlay(){ if(playTimer){ clearInterval(playTimer); playTimer=null; $("playBtn").textContent="▶ Reproducir línea de tiempo"; } }
  $("playBtn").addEventListener("click", function(){
    if(playTimer){ stopPlay(); return; }
    this.textContent="⏸ Pausar"; stepTimeline();
    playTimer=setInterval(stepTimeline, 3200);
  });
  $("randomBtn").addEventListener("click", function(){
    stopPlay(); var n; do{ n=Math.floor(Math.random()*imgs.length); }while(n===current && imgs.length>1);
    document.querySelectorAll(".tl-btn").forEach(function(x){x.classList.remove("on");});
    selectImage(n, "Al azar salió: "+imgs[n].titulo+". Buen ojo, dado.");
  });
  if(imgs.length){ var f=(C.lineaDeTiempo||[])[0]; selectImage(f?f.imagen:0, f?f.nota:""); thumbs.querySelectorAll(".thumb").forEach(function(t,j){ t.classList.toggle("on", j===current); }); }

  /* ===== COMPARADOR — sin arrastre, ANTES Y AHORA ===== */
  /* Par propio y fijo en CONFIG.comparacion: una imagen pasada y una actual.
     NO toma las imágenes del visor (antes tomaba el mapa completo y el
     díptico de la misma nube en dos colores, y eso ya no va aquí).
     Calcula los meses reales entre las dos fechas y avisa si bajan de 6. */
  (function(){
    var cmp=C.comparacion||{}, p=cmp.pasada, n=cmp.actual;
    var a=$("compareImgA"), b=$("compareImgB");
    if(!a||!b||!p||!n) return;
    a.src=p.src; a.alt=p.alt;
    b.src=n.src; b.alt=n.alt;
    var tagA=$("compareTagA"), tagB=$("compareTagB");
    if(tagA) tagA.textContent=("PASADA · "+p.fechaTexto).toUpperCase();
    if(tagB) tagB.textContent=("ACTUAL · "+n.fechaTexto).toUpperCase();
    var ta=$("compareTitleA"), ma=$("compareMetaA"), tb=$("compareTitleB"), mb=$("compareMetaB");
    if(ta) ta.textContent=p.titulo;
    if(ma) ma.textContent=p.detalle+" · "+p.credito;
    if(tb) tb.textContent=n.titulo;
    if(mb) mb.textContent=n.detalle+" · "+n.credito;
    var gap=$("compareGap");
    if(gap && p.fechaISO && n.fechaISO){
      var d1=new Date(p.fechaISO+"T00:00:00"), d2=new Date(n.fechaISO+"T00:00:00");
      if(!isNaN(d1) && !isNaN(d2)){
        var months=(d2.getFullYear()-d1.getFullYear())*12+(d2.getMonth()-d1.getMonth())+(d2.getDate()-d1.getDate())/30.44;
        var whole=Math.floor(months);
        gap.textContent = whole>=6
          ? "Entre la imagen pasada ("+p.fechaTexto.toLowerCase()+") y la actual ("+n.fechaTexto.toLowerCase()+") hay "+whole+" meses de diferencia: más que el mínimo de 6 meses."
          : "Ojo: entre la imagen pasada ("+p.fechaTexto.toLowerCase()+") y la actual ("+n.fechaTexto.toLowerCase()+") hay solo "+whole+" meses; esta comparación pide un mínimo de 6 meses entre las dos.";
      }
    }
  })();

  /* ===== COORDENADAS + CIELO EN VIVO QUE PARPADEA (NASA SkyView / IRSA) ===== */
  var blinkState={ra:83.822, dec:-5.391, fov:1, name:"Nebulosa de Orión"};
  function skyViewUrl(ra, dec, fov, survey){
    return "https://skyview.gsfc.nasa.gov/current/cgi/query.pl?Position="+encodeURIComponent(ra.toFixed(4)+","+dec.toFixed(4))+"&Size="+encodeURIComponent(fov||1)+"&Survey="+encodeURIComponent(survey||"DSS");
  }
  /* Imagen REAL de NASA SkyView: runquery.pl con Return=JPEG devuelve un JPEG
     del punto exacto (verificado). query.pl, en cambio, devuelve una página
     HTML: por eso antes la imagen nunca cargaba y el visor no cambiaba.
     La dirección se arma SIEMPRE igual (misma coma, mismo orden) para que el
     navegador aproveche su caché y no descargue la misma imagen dos veces.
     Scaling=Sqrt es el estiramiento equilibrado de SkyView: con el ajuste
     normal (lineal), la imagen infrarroja DSS2 IR sale quemada —medimos un
     brillo medio de 208 sobre 255, casi todo blanco— y con Sqrt baja a
     ~100, con el fondo oscuro y los detalles visibles, igual que las demás
     épocas. Así ninguna época sale más blanca que otra, sin filtros encima.
     Todo se pide en 1024 px, la calidad alta, también las épocas 1 a 3. */
  function skyViewImgUrl(pos, fov, survey, pixels, scaling){
    var p=/^[0-9.,+\-\s]+$/.test(pos) ? String(pos).replace(/\s+/g,"") : encodeURIComponent(pos);
    return "https://skyview.gsfc.nasa.gov/current/cgi/runquery.pl?Position="+p+"&Size="+(fov||1)+"&Survey="+String(survey||"DSS").replace(/ /g,"%20")+"&Pixels="+(pixels||1024)+"&Scaling="+(scaling||"Sqrt")+"&Return=JPEG";
  }
  /* Cargador de imágenes oficiales: ver la nota del cargador rápido más
     abajo. Si una imagen no llega ni tras los reintentos, se queda la
     imagen anterior (o la de respaldo la primera vez): nunca un hueco
     en negro. */
  /* CARGADOR RÁPIDO, POR DIRECCIÓN ÚNICA Y CON PRIORIDADES.
     El cuello de botella es el servidor de SkyView: tarda ~5 s en generar
     cada imagen, NO guarda copia (pedir la misma dirección dos veces son
     otros ~5 s) y si recibe muchas a la vez responde “Too Many Processes”.
     Antes, al elegir un lugar se le pedían 7 imágenes sueltas, y tres de
     ellas eran LA MISMA dirección repetida (la DSS del punto sale en la
     imagen principal, en la época 1 y en el visor que parpadea; la DSS2 IR
     en la época 4 y en el visor). Ahora hay UN solo trabajo por dirección:
     se genera una vez y se reparte a todas las etiquetas que la usan.
     Orden de llegada pensado para que se note rápido: primero la imagen
     principal del punto, después la infrarroja, y al final las épocas 2
     y 3 de la comparación. Máximo 2 generaciones a la vez (más satura el
     servidor y todo tarda más), con reintentos con espera si SkyView se
     satura, y tiempo límite por trabajo para que nada se quede colgado. */
  var skyJobs={}, skyQueue=[], skyBusy=0, skyDoneOnce=false, skySeq=0;
  function skyStatusUpdate(){ /* Sin avisos de carga en pantalla: la página solo funciona. */ }
  function sortSkyQueue(){ skyQueue.sort(function(a,b){ return (a.prio-b.prio) || (a.seq-b.seq); }); }
  function purgeSkyQueue(){
    skyQueue=skyQueue.filter(function(job){
      job.targets=job.targets.filter(function(im){ return im.dataset.skyWant===job.url; });
      if(!job.targets.length && job.state==="queued"){ delete skyJobs[job.url]; return false; }
      return true;
    });
  }
  function loadOfficialImg(imgEl, url, prio){
    if(!imgEl||!url) return;
    if(imgEl.dataset.skyWant===url && imgEl.dataset.skyState==="ok") return;
    imgEl.dataset.skyWant=url;
    imgEl.dataset.skyState="loading";
    imgEl.classList.add("cargando");
    var job=skyJobs[url];
    if(job && job.state==="ok"){
      /* Esta dirección ya se generó una vez en esta sesión: el navegador
         la sirve de su memoria, sin pedirla otra vez a SkyView. */
      imgEl.src=url;
      imgEl.dataset.skyState="ok"; imgEl.dataset.skyOkEver="1";
      imgEl.classList.remove("cargando");
      skyDoneOnce=true; skyStatusUpdate(); return;
    }
    if(!job){
      job=skyJobs[url]={url:url, state:"queued", targets:[], tries:0, prio:(prio==null?5:prio), seq:skySeq++};
      skyQueue.push(job);
    } else {
      if(prio!=null && prio<job.prio) job.prio=prio;
      if(job.state==="error"){ job.state="queued"; job.tries=0; if(skyQueue.indexOf(job)===-1) skyQueue.push(job); }
    }
    if(job.targets.indexOf(imgEl)===-1) job.targets.push(imgEl);
    sortSkyQueue(); skyStatusUpdate(); pumpSky();
  }
  function pumpSky(){
    purgeSkyQueue(); sortSkyQueue();
    while(skyBusy<2 && skyQueue.length){
      var job=skyQueue.shift();
      if(job.state!=="queued") continue;
      job.targets=job.targets.filter(function(im){ return im.dataset.skyWant===job.url; });
      if(!job.targets.length){ delete skyJobs[job.url]; continue; }
      job.state="loading"; skyBusy++; runSkyJob(job);
    }
    skyStatusUpdate();
  }
  function runSkyJob(job){
    var loader=new Image(), settled=false;
    var timer=setTimeout(function(){ finish(false); }, 45000);
    function finish(ok){
      if(settled) return; settled=true;
      clearTimeout(timer);
      loader.onload=null; loader.onerror=null;
      skyBusy--;
      if(ok){
        job.state="ok"; skyDoneOnce=true;
        /* Se asigna la misma dirección a todas las etiquetas a la vez:
           el navegador la toma de la copia que acaba de descargar. */
        job.targets.forEach(function(im){
          if(im.dataset.skyWant!==job.url) return;
          im.dataset.skyState="ok"; im.dataset.skyOkEver="1";
          im.classList.remove("cargando");
          if(im.src!==job.url) im.src=job.url;
        });
      } else if(job.tries<2){
        /* SkyView saturado o lento: esperar un poco y reintentar, sin
           bloquear el otro hueco de la cola. */
        job.tries++; job.state="queued";
        var delay=(job.tries===1)?1500:3500;
        setTimeout(function(){ if(job.state==="queued" && skyJobs[job.url]===job){ if(skyQueue.indexOf(job)===-1) skyQueue.push(job); sortSkyQueue(); pumpSky(); } }, delay);
      } else {
        job.state="error";
        job.targets.forEach(function(im){
          if(im.dataset.skyWant!==job.url) return;
          im.dataset.skyState="error"; im.classList.remove("cargando");
          if(!im.dataset.skyOkEver) im.src=window.IMAGES.mapaCieloCompleto;
        });
      }
      skyStatusUpdate(); pumpSky();
    }
    loader.onload=function(){ finish(true); };
    loader.onerror=function(){ finish(false); };
    loader.src=job.url;
  }
  /* COMPARACIÓN POR COORDENADAS EN EL TIEMPO — 5 MOMENTOS: el mismo punto
     en la imagen ACTUAL y en las de hace ≈6, ≈12, ≈18 y ≈24 meses, lado a
     lado y sin arrastrar, con pasos de unos 6 meses entre una y otra.
     Cada momento es una campaña real y distinta de NASA SkyView, ordenadas
     de la más reciente a la más antigua, y las cinco se verificaron contra
     el servicio: devuelven un JPEG real del punto en 1024 px.
     ACTUAL: DSS2 IR, infrarrojo, la más reciente.
     ≈6 MESES: DSS2 Red.  ≈12 MESES: DSS2 Blue.  ≈18 MESES: DSS, placas
     originales.  ≈24 MESES: IRAS 100 µm con Scaling=Log, la más antigua
     de la serie. OJO: antes este hueco usaba GALEX Near UV y NO se veía:
     se verificó contra el servicio y en Orión devolvía una imagen casi
     negra (brillo medio 0,5 sobre 255; en Andrómeda, centro galáctico y
     Gran Nube, menos del 5 % de píxeles visibles). IRAS 100 con el
     estiramiento Log de SkyView sí se ve en los cinco puntos probados
     (brillo medio entre 57 y 114): muestra el brillo difuso del polvo,
     con menos detalle que las placas DSS porque IRAS (1983) tenía menos
     resolución, pero la imagen se ve, nunca en negro.
     SkyView no publica la fecha exacta de cada foto por punto, así que los
     pasos se etiquetan como aproximados (≈), tal como pidió el equipo:
     "más o menos 6 meses" entre una imagen y la siguiente. */
  function loadCoordCompare(pos, fov, label){
    /* Prioridades: la actual (DSS2 IR) comparte dirección con el visor que
       parpadea y la de ≈18 meses (DSS) con la imagen principal del punto,
       así que llegan primero; las demás van detrás, de dos en dos. */
    loadOfficialImg($("coordCmpRecentImg"), skyViewImgUrl(pos, fov, "DSS2 IR", 1024), 2);
    loadOfficialImg($("coordCmpE3Img"), skyViewImgUrl(pos, fov, "DSS2 Red"), 4);
    loadOfficialImg($("coordCmpE2Img"), skyViewImgUrl(pos, fov, "DSS2 Blue"), 3);
    loadOfficialImg($("coordCmpPastImg"), skyViewImgUrl(pos, fov, "DSS"), 1);
    loadOfficialImg($("coordCmpOldImg"), skyViewImgUrl(pos, fov, "IRAS 100", 1024, "Log"), 5);
    var where=label||pos;
    var t0=$("coordCmpRecentTitle"); if(t0) t0.textContent="Actual: "+where;
    var t1=$("coordCmpE3Title"); if(t1) t1.textContent="Hace ≈6 meses: "+where;
    var t2=$("coordCmpE2Title"); if(t2) t2.textContent="Hace ≈12 meses: "+where;
    var t3=$("coordCmpPastTitle"); if(t3) t3.textContent="Hace ≈18 meses: "+where;
    var t4=$("coordCmpOldTitle"); if(t4) t4.textContent="Hace ≈24 meses: "+where;
    var gap=$("coordCmpGap");
    if(gap) gap.textContent="Cinco momentos de "+where+", de la imagen actual a la de hace unos 24 meses.";
  }
  function updateBlinkViewer(ra, dec, fov, name){
    blinkState.ra=ra; blinkState.dec=dec; blinkState.fov=fov||blinkState.fov||1; if(name) blinkState.name=name;
    var bc=$("blinkCoords"); if(bc) bc.textContent=formatRaDec(ra,dec)+(blinkState.name?" · "+blinkState.name:"");
    var irsaA=$("blinkIrsaLink"); if(irsaA) irsaA.href="#irsa";
    var svA=$("blinkSkyViewLink"); if(svA) svA.href=skyViewUrl(ra,dec,blinkState.fov,"DSS");
    /* Imagen independiente del comparador: se piden a NASA SkyView las dos
       vistas de ESTE punto (visible DSS e infrarrojo DSS2 IR) y parpadean
       entre sí. Se piden en 1024 px y con el estiramiento equilibrado de
       SkyView (Scaling=Sqrt), sin filtros de pantalla: así la infrarroja
       ya no sale blanca ni quemada, igual que en la comparación. Las trae
       el cargador con cola y reintento de arriba. */
    var pos=ra.toFixed(4)+","+dec.toFixed(4);
    loadOfficialImg($("blinkImgA"), skyViewImgUrl(pos, blinkState.fov, "DSS", 1024), 1);
    loadOfficialImg($("blinkImgB"), skyViewImgUrl(pos, blinkState.fov, "DSS2 IR", 1024), 2);
    var lbl=$("blinkLabel"); if(lbl) lbl.textContent="Parpadeando: luz visible (DSS) ↔ infrarrojo (DSS2) · NASA SkyView";
  }
  function parseCoord(txt, isRa){
    if(txt===null||txt===undefined) return null;
    txt=String(txt).trim().replace(/,/g, ".").replace(/[hmsd°:]/gi, " ").replace(/\s+/g, " ").trim();
    if(!txt) return null;
    var parts=txt.split(" ").filter(Boolean);
    if(parts.length===1){
      var v=parseFloat(parts[0]); if(isNaN(v)) return null;
      return v;
    }
    /* Sexagesimal: RA en horas o Dec en grados */
    var sign=1; var first=parseFloat(parts[0]);
    if(isNaN(first)) return null;
    if(parts[0].indexOf("-")===0) sign=-1;
    var a=Math.abs(first), m=parseFloat(parts[1]||"0")||0, s=parseFloat(parts[2]||"0")||0;
    var decDeg=a + m/60 + s/3600;
    if(isRa){
      /* Si viene en horas (valor <=24 y con 3 partes, o el usuario usó formato h), convertir a grados.
         Heurística: 3 partes y primer valor <=24 => horas. */
      if(parts.length>=2 && a<=24) return decDeg*15;
      return decDeg;
    }
    return sign*decDeg;
  }
  function formatRaDec(ra, dec){
    return "RA "+ra.toFixed(3)+"° · Dec "+(dec>=0?"+":"")+dec.toFixed(3)+"°";
  }
  function gotoSky(ra, dec, fov, name){
    var err=$("coordError"); if(err) err.textContent="";
    if(isNaN(ra)||isNaN(dec)){ if(err) err.textContent="Escribe coordenadas válidas, por ejemplo RA 83.822 y Dec -5.391, o toca un ejemplo."; return; }
    ra=((ra%360)+360)%360;
    if(dec<-90||dec>90){ if(err) err.textContent="La Declinación debe estar entre -90° y +90°."; return; }
    if(!fov||isNaN(fov)) fov=parseFloat(($("fovInput")||{}).value||"1");
    var sum=$("coordSummary"), res=$("coordResult"), copy=$("coordCopy");
    if(sum) sum.textContent=(name? name+" — " : "Tu punto — ")+formatRaDec(ra,dec)+". Estos enlaces oficiales de NASA e IRSA abren exactamente ese punto:";
    if(res) res.style.display="grid";
    var li=$("linkIrsaCoord"); if(li) li.href="#irsa";
    var lf=$("linkIrsaFinder"); if(lf) lf.href="https://irsa.ipac.caltech.edu/applications/finderchart/";
    var lv=$("linkSkyView"); if(lv) lv.href=skyViewUrl(ra,dec,fov,"DSS");
    var la2=$("linkIrsaArchive"); if(la2) la2.href="https://irsa.ipac.caltech.edu/cgi-bin/Gator/nph-scan?mission=irsa&submit=Select&projshort=SPHEREx";
    if(copy) copy.textContent="Para IRSA pega esto: RA = "+ra.toFixed(4)+", Dec = "+dec.toFixed(4);
    /* La imagen de ESE punto, aquí mismo: NASA SkyView genera un JPEG real
       para estas coordenadas. Si la red falla se queda la imagen anterior. */
    loadOfficialImg($("coordImg"), skyViewImgUrl(ra.toFixed(4)+","+dec.toFixed(4), fov, "DSS"), 0);
    var cap=$("coordImgCap"); if(cap) cap.textContent="Imagen oficial de NASA SkyView (NASA GSFC) de "+formatRaDec(ra,dec)+".";
    /* Y la comparación DE ESE PUNTO: pasada (DSS) vs. la más reciente (DSS2 IR) */
    loadCoordCompare(ra.toFixed(4)+","+dec.toFixed(4), fov, name||formatRaDec(ra,dec));
    /* Mover también el cielo en vivo que parpadea a este punto, SIN arrastrar
       la página: los enlaces quedan a la vista aquí mismo. */
    updateBlinkViewer(ra, dec, fov, name);
    /* Y también el visor de SPHEREx y el mapa real de IRSA siguen a este punto. */
    updateSpherexViewer(ra, dec, fov, name);
    setFinderFrame(ra, dec, name);
    var la=$("linkAladin"); if(la) la.href="https://aladin.cds.unistra.fr/AladinLite/?target="+encodeURIComponent(ra.toFixed(4)+" "+dec.toFixed(4))+"&fov="+(fov||1);
    toast("Punto fijado: "+formatRaDec(ra,dec)+" — cargando las imágenes oficiales de ese lugar…");
  }
  /* Pone el selector de campo en el zoom que se usó, para que el visitante
     vea qué zoom se aplicó (cada objeto tiene su propio fov según su tamaño). */
  function setFovInput(fov){
    var sel=$("fovInput"); if(!sel||isNaN(fov)) return;
    var v=String(fov);
    for(var i=0;i<sel.options.length;i++){ if(sel.options[i].value===v){ sel.value=v; return; } }
  }
  /* Presets */
  document.querySelectorAll("[data-ra][data-dec]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var ra=parseFloat(btn.getAttribute("data-ra")), dec=parseFloat(btn.getAttribute("data-dec")), nm=btn.getAttribute("data-name")||btn.textContent;
      var raIn=$("raInput"), decIn=$("decInput"), nmIn=$("coordName");
      if(raIn) raIn.value=ra; if(decIn) decIn.value=dec; if(nmIn) nmIn.value="";
      var fovAttr=parseFloat(btn.getAttribute("data-fov")||"");
      var fov=isNaN(fovAttr)?parseFloat(($("fovInput")||{}).value||"1"):fovAttr;
      setFovInput(fov);
      gotoSky(ra, dec, fov, nm);
    });
  });
  /* ===== BUSCADOR POR NOMBRE, MÁS LISTO =====
     Catálogo de objetos conocidos con sus coordenadas (J2000, las mismas
     que usan IRSA y NASA SkyView). Reconoce el nombre aunque se escriba
     sin acentos, en minúsculas, en inglés, por su apodo o por su número
     de catálogo (M42, M31…), sugiere mientras escribes, rellena RA y Dec
     solo y lleva al punto en automático al pulsar el botón.
     Para agregar un objeto: copia una línea y pon nombre, RA, Dec, fov (campo en grados, según el tamaño angular del objeto) y apodos. */
  var OBJETOS=[
    {n:"Nebulosa de Orión (M42)", ra:83.822, dec:-5.391, fov:1, a:["orion","m42","nebulosa de orion","orion nebula","espada de orion"]},
    {n:"Galaxia de Andrómeda (M31)", ra:10.685, dec:41.269, fov:3, a:["andromeda","m31","andromeda galaxy","galaxia de andromeda"]},
    {n:"Centro de la Vía Láctea", ra:266.405, dec:-28.936, fov:3, a:["centro galactico","centro de la via lactea","galactic center","sagitario a","sagittarius a"]},
    {n:"Gran Nube de Magallanes", ra:80.894, dec:-69.756, fov:6, a:["lmc","nube de magallanes","gran nube","large magellanic cloud"]},
    {n:"Pequeña Nube de Magallanes", ra:13.187, dec:-72.829, fov:3, a:["smc","pequena nube","small magellanic cloud"]},
    {n:"Galaxia M87 · Cúmulo de Virgo", ra:187.706, dec:12.391, fov:0.5, a:["m87","virgo","cumulo de virgo","virgo cluster"]},
    {n:"Pléyades (M45)", ra:56.750, dec:24.117, fov:2, a:["pleyades","m45","pleiades","siete hermanas","seven sisters"]},
    {n:"Nebulosa del Cangrejo (M1)", ra:83.633, dec:22.014, fov:0.2, a:["cangrejo","m1","crab nebula","nebulosa del cangrejo"]},
    {n:"Nebulosa del Anillo (M57)", ra:283.396, dec:33.029, fov:0.1, a:["anillo","m57","ring nebula","nebulosa del anillo","nebulosa anular"]},
    {n:"Nebulosa Dumbbell (M27)", ra:297.696, dec:22.721, fov:0.3, a:["dumbbell","m27","nebulosa dumbbell","nebulosa de la manzana"]},
    {n:"Nebulosa del Águila (M16)", ra:274.700, dec:-13.800, fov:0.5, a:["aguila","m16","eagle nebula","nebulosa del aguila","pilares de la creacion"]},
    {n:"Nebulosa Omega (M17)", ra:275.100, dec:-16.170, fov:0.5, a:["omega","m17","omega nebula","nebulosa omega","nebulosa del cisne"]},
    {n:"Nebulosa de la Laguna (M8)", ra:270.900, dec:-24.380, fov:1, a:["laguna","m8","lagoon nebula","nebulosa de la laguna"]},
    {n:"Nebulosa Trífida (M20)", ra:270.600, dec:-23.030, fov:0.5, a:["trifida","m20","trifid nebula","nebulosa trifida"]},
    {n:"Galaxia del Remolino (M51)", ra:202.470, dec:47.195, fov:0.5, a:["remolino","m51","whirlpool","whirlpool galaxy","galaxia del remolino"]},
    {n:"Galaxia del Sombrero (M104)", ra:189.997, dec:-11.623, fov:0.3, a:["sombrero","m104","sombrero galaxy","galaxia del sombrero"]},
    {n:"Galaxia del Molinete (M101)", ra:210.802, dec:54.349, fov:1, a:["molinete","m101","pinwheel","pinwheel galaxy","galaxia del molinete"]},
    {n:"Galaxia del Triángulo (M33)", ra:23.462, dec:30.660, fov:1.5, a:["triangulo","m33","triangulum","triangulum galaxy","galaxia del triangulo"]},
    {n:"Nebulosa Cabeza de Caballo", ra:85.250, dec:-2.458, fov:0.5, a:["cabeza de caballo","horsehead","horsehead nebula","barnard 33","b33"]},
    {n:"Nebulosa de la Hélice", ra:337.410, dec:-20.837, fov:0.5, a:["helice","helix","helix nebula","nebulosa de la helice","ojo de dios"]},
    {n:"Nebulosa Ojo de Gato", ra:269.639, dec:66.633, fov:0.1, a:["ojo de gato","cats eye","cat eye nebula","nebulosa ojo de gato"]},
    {n:"Omega Centauri", ra:201.697, dec:-47.477, fov:1, a:["omega centauri","ngc 5139"]},
    {n:"47 Tucanae", ra:6.024, dec:-72.081, fov:0.5, a:["47 tuc","tucanae","47 tucanae","ngc 104"]},
    {n:"Nebulosa de la Tarántula", ra:84.676, dec:-69.100, fov:1, a:["tarantula","nebulosa de la tarantula","tarantula nebula","30 doradus"]},
    {n:"Nebulosa de Carina", ra:161.020, dec:-59.870, fov:1.5, a:["carina","nebulosa de carina","carina nebula","eta carinae"]},
    {n:"Nebulosa de Norteamérica", ra:314.000, dec:44.530, fov:2, a:["norteamerica","nebulosa de norteamerica","north america nebula","ngc 7000"]},
    {n:"Nebulosa del Velo", ra:312.780, dec:30.710, fov:3, a:["velo","nebulosa del velo","veil nebula"]},
    {n:"Cúmulo de Hércules (M13)", ra:250.420, dec:36.460, fov:0.5, a:["hercules","m13","cumulo de hercules","great hercules cluster"]}
  ];
  function normName(s){
    return String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9 ]/g," ").replace(/\s+/g," ").trim();
  }
  function findObjeto(q){
    var query=normName(q); if(query.length<2) return null;
    var best=null, bestScore=0;
    OBJETOS.forEach(function(o){
      var names=[normName(o.n)].concat((o.a||[]).map(normName));
      names.forEach(function(nm){
        var score=0;
        var qs=query.replace(/ /g,""), ns=nm.replace(/ /g,"");
        if(nm===query || ns===qs) score=100;
        else if(nm.indexOf(query)===0) score=80;
        else if(nm.indexOf(query)>-1 || (qs.length>=3 && ns.indexOf(qs)>-1)) score=60;
        else if(nm.length>=3 && query.indexOf(nm)>-1) score=55;
        else {
          var qt=query.split(" "), nt=nm.split(" "), hit=0;
          qt.forEach(function(t){ if(t.length>=3 && nt.indexOf(t)>-1) hit++; });
          if(hit>0 && hit>=Math.min(qt.length,2)) score=40+hit;
        }
        if(score>bestScore){ bestScore=score; best=o; }
      });
    });
    return bestScore>=40 ? best : null;
  }
  /* Sugerencias mientras se escribe + reconocimiento en vivo */
  var objetosList=$("objetosList");
  if(objetosList) OBJETOS.forEach(function(o){ var op=document.createElement("option"); op.value=o.n; objetosList.appendChild(op); });
  var coordNameInput=$("coordName");
  if(coordNameInput) coordNameInput.addEventListener("input", function(){
    var hint=$("nameHint"); if(!hint) return;
    var o=findObjeto(coordNameInput.value);
    if(o){
      var rI=$("raInput"), dI=$("decInput");
      if(rI) rI.value=o.ra; if(dI) dI.value=o.dec;
      hint.style.color="var(--verde)";
      hint.textContent="✔ Reconocí “"+o.n+"”: sus coordenadas ya están puestas abajo (RA "+o.ra+"° · Dec "+(o.dec>=0?"+":"")+o.dec+"°). Pulsa el botón y te llevo directo a ese punto.";
    } else {
      hint.style.color="";
      if(coordNameInput.value.trim().length>=3) hint.textContent="Ese nombre todavía no está en mi lista de objetos conocidos. Si tienes sus coordenadas, escríbelas abajo; o prueba con otro nombre: Orión, Andrómeda, Pléyades, M87, ojo de gato…";
    }
  });

  var coordForm=$("coordForm");
  if(coordForm) coordForm.addEventListener("submit", function(e){
    e.preventDefault();
    var name=($("coordName")||{}).value||"";
    /* Si el nombre se reconoce, ir a ese punto en automático, sin pedir
       coordenadas a mano: se rellenan y se actualiza todo (imagen,
       comparación en el tiempo —actual y hace 6, 12, 18 y 24 meses—,
       enlaces oficiales y cielo en vivo). */
    var found=findObjeto(name);
    if(found){
      var raInF=$("raInput"), decInF=$("decInput");
      if(raInF) raInF.value=found.ra; if(decInF) decInF.value=found.dec;
      var fovF=(found.fov&&!isNaN(found.fov))?found.fov:parseFloat(($("fovInput")||{}).value||"1");
      setFovInput(fovF);
      gotoSky(found.ra, found.dec, fovF, found.n);
      return;
    }
    /* Si solo hay nombre y no coordenadas, mandar a IRSA / NASA SkyView por nombre y avisar */
    var raTxt=($("raInput")||{}).value||"", decTxt=($("decInput")||{}).value||"";
    if((!raTxt.trim()||!decTxt.trim()) && name.trim()){
      var res=$("coordResult"), sum=$("coordSummary");
      if(sum) sum.textContent="Buscando por nombre: “"+name.trim()+"”. Ábrelo en los sitios oficiales de NASA e IRSA:";
      if(res) res.style.display="grid";
      var fovNF=parseFloat(($("fovInput")||{}).value||"1");
      var lv2=$("linkSkyView"); if(lv2) lv2.href="https://skyview.gsfc.nasa.gov/current/cgi/query.pl?Position="+encodeURIComponent(name.trim())+"&Size="+fovNF+"&Survey=DSS";
      var lf2=$("linkIrsaFinder"); if(lf2) lf2.href="https://irsa.ipac.caltech.edu/applications/finderchart/";
      loadOfficialImg($("coordImg"), skyViewImgUrl(name.trim(), fovNF, "DSS"), 0);
      var cap2=$("coordImgCap"); if(cap2) cap2.textContent="Imagen oficial de NASA SkyView (NASA GSFC) de “"+name.trim()+"”.";
      loadCoordCompare(name.trim(), fovNF, name.trim());
      if($("coordError")) $("coordError").textContent="Ese nombre no está en la lista de objetos que reconozco automáticamente; NASA SkyView intentó resolverlo por su cuenta. Para mover también el visor que parpadea de esta página, agrega RA y Dec (los ejemplos de arriba ya los traen).";
      return;
    }
    var ra=parseCoord(raTxt, true), dec=parseCoord(decTxt, false);
    var fov=parseFloat(($("fovInput")||{}).value||"1");
    gotoSky(ra, dec, fov, name.trim()||null);
  });
  /* Controles del visor que parpadea: flechas mueven el punto y piden imagen nueva */
  (function(){
    var stage=$("blinkStage"), toggle=$("blinkToggle");
    if(toggle && stage) toggle.addEventListener("click", function(){
      var paused=stage.classList.toggle("paused");
      toggle.textContent=paused?"Reanudar parpadeo":"Pausar parpadeo";
    });
    function move(dRa, dDec){
      var ra=((blinkState.ra+dRa)%360+360)%360;
      var dec=Math.max(-89, Math.min(89, blinkState.dec+dDec));
      var raIn=$("raInput"), decIn=$("decInput"); if(raIn) raIn.value=ra.toFixed(3); if(decIn) decIn.value=dec.toFixed(3);
      updateBlinkViewer(ra, dec, blinkState.fov, blinkState.name);
      var sum=$("coordSummary"), res=$("coordResult");
      if(sum) sum.textContent="Tu punto — "+formatRaDec(ra,dec)+". Estos enlaces oficiales de NASA e IRSA abren exactamente ese punto:";
      if(res) res.style.display="grid";
      var lv=$("linkSkyView"); if(lv) lv.href=skyViewUrl(ra,dec,blinkState.fov,"DSS");
      var copy=$("coordCopy"); if(copy) copy.textContent="Para IRSA pega esto: RA = "+ra.toFixed(4)+", Dec = "+dec.toFixed(4);
      loadOfficialImg($("coordImg"), skyViewImgUrl(ra.toFixed(4)+","+dec.toFixed(4), blinkState.fov, "DSS"), 0);
      var cap3=$("coordImgCap"); if(cap3) cap3.textContent="Imagen oficial de NASA SkyView (NASA GSFC) de "+formatRaDec(ra,dec)+".";
      loadCoordCompare(ra.toFixed(4)+","+dec.toFixed(4), blinkState.fov, blinkState.name||formatRaDec(ra,dec));
    }
    var step=function(){ return Math.max(0.05,(blinkState.fov||1)*0.25); };
    var bu=$("blinkUp"), bd=$("blinkDown"), bl=$("blinkLeft"), br=$("blinkRight");
    if(bu) bu.addEventListener("click", function(){ move(0, step()); });
    if(bd) bd.addEventListener("click", function(){ move(0, -step()); });
    if(bl) bl.addEventListener("click", function(){ move(-step(), 0); });
    if(br) br.addEventListener("click", function(){ move(step(), 0); });
    if(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches && stage){ stage.classList.add("paused"); if(toggle) toggle.textContent="Reanudar parpadeo"; }
  })();
  /* Carga inicial: la imagen que parpadea pide desde el principio sus dos
     vistas reales a NASA SkyView (punto de partida: Nebulosa de Orión). */
  updateBlinkViewer(blinkState.ra, blinkState.dec, blinkState.fov, blinkState.name);
  /* Carga inicial de la comparación por coordenadas (mismo punto de partida) */
  loadCoordCompare(blinkState.ra.toFixed(4)+","+blinkState.dec.toFixed(4), blinkState.fov, blinkState.name);

  /* Pestañas de Coordenadas: Tu punto / En el tiempo / Cielo en vivo */
  document.querySelectorAll("[data-ctab]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var key=btn.getAttribute("data-ctab");
      document.querySelectorAll("[data-ctab]").forEach(function(b){ var on=b===btn; b.classList.toggle("on", on); b.setAttribute("aria-selected", on?"true":"false"); });
      document.querySelectorAll("[data-cpanel]").forEach(function(p){ p.hidden = p.getAttribute("data-cpanel")!==key; });
    });
  });

  /* ===== MAPA REAL DEL CIELO (IRSA Viewer / Finder Chart) ===== */
  function finderUrl(ra, dec){
    return "https://irsa.ipac.caltech.edu/applications/finderchart/servlet/api?mode=getResult&locstr=" + encodeURIComponent(ra + " " + dec);
  }
  function setFrameSrc(frame, url){
    if(!frame) return;
    if(frame.getAttribute("src")===url){ frame.src="about:blank"; setTimeout(function(){ frame.src=url; }, 60); }
    else { frame.src=url; }
  }
  function spherexUrl(ra, dec, fov){
    var sr=Math.min(fov||1, 3);
    return "https://irsa.ipac.caltech.edu/applications/spherex/?api=spectral-images&ra="+ra.toFixed(4)+"&dec="+dec.toFixed(4)+"&sr="+sr+"d";
  }
  function updateSpherexViewer(ra, dec, fov, name){
    var f=$("spherexFrame"); if(!f) return;
    setFrameSrc(f, spherexUrl(ra, dec, fov));
    var sc=$("spherexCoords"); if(sc) sc.textContent="Punto del visor: "+(name?name+" — ":"")+formatRaDec(ra, dec)+".";
    spherexLastRa=ra; spherexLastDec=dec;
    checkSpherexHealth(ra, dec);
  }
  /* ===== AVISO DE ERROR DEL VISOR DE IRSA ===== */
  /* La ventana de IRSA es de otro dominio: esta página no puede ver qué
     muestra dentro. Lo que sí puede comprobar es si IRSA responde: hace una
     consulta pequeña por el mismo camino que usa la página y, si IRSA no
     responde, muestra el aviso. Así aparece justo cuando la aplicación de
     IRSA muestra su error TAP o su buscador no termina de cargar. */
  var SPHEREX_API="https://spherex-explorer-api.gaaronzaid.workers.dev";
  var spherexLastRa=83.822, spherexLastDec=-5.391;
  function showSpherexError(){ var e=$("spherexError"); if(e) e.hidden=false; }
  function hideSpherexError(){ var e=$("spherexError"); if(e) e.hidden=true; }
  function checkSpherexHealth(ra, dec){
    var ctrl=null;
    try{ ctrl=new AbortController(); }catch(err){ ctrl=null; }
    var to=setTimeout(function(){ if(ctrl) ctrl.abort(); }, 15000);
    var url=SPHEREX_API+"/api/sia?collection=spherex_qr3&ra="+(ra==null?spherexLastRa:ra)+"&dec="+(dec==null?spherexLastDec:dec)+"&radius=0.01&maxrec=1";
    fetch(url, ctrl?{signal:ctrl.signal}:{ })
      .then(function(r){ clearTimeout(to); if(r.ok) hideSpherexError(); else showSpherexError(); })
      .catch(function(){ clearTimeout(to); showSpherexError(); });
  }
  checkSpherexHealth(spherexLastRa, spherexLastDec);
  setInterval(function(){ if(!document.hidden) checkSpherexHealth(spherexLastRa, spherexLastDec); }, 60000);
  function setFinderFrame(ra, dec, name){
    var f=$("finderFrame"); if(!f) return;
    var url=finderUrl(ra, dec);
    if(f.getAttribute("src")===url){ f.src="about:blank"; setTimeout(function(){ f.src=url; }, 60); }
    else { f.src=url; }
    var open=$("mapFinderOpen"); if(open) open.href=url;
    var mc=$("mapCoords"); if(mc) mc.textContent="Punto del mapa: "+(name?name+" — ":"")+formatRaDec(ra, dec)+".";
  }
  document.querySelectorAll("[data-mtab]").forEach(function(btn){
    btn.addEventListener("click", function(){
      var key=btn.getAttribute("data-mtab");
      document.querySelectorAll("[data-mtab]").forEach(function(b){ var on=b===btn; b.classList.toggle("on", on); b.setAttribute("aria-selected", on?"true":"false"); });
      document.querySelectorAll("[data-mpanel]").forEach(function(p){ p.hidden = p.getAttribute("data-mpanel")!==key; });
    });
  });
  /* El botón "Finder Chart" además de mostrar el mapa lo vuelve a centrar
     en el punto que está en el formulario (el último punto buscado). */
  var finderTab=document.querySelector("[data-mtab='finder']");
  if(finderTab) finderTab.addEventListener("click", function(){
    var ra=parseCoord($("raInput").value, true), dec=parseCoord($("decInput").value, false);
    if(isNaN(ra)||isNaN(dec)||dec<-90||dec>90) return;
    ra=((ra%360)+360)%360;
    var name=$("coordName") ? $("coordName").value.trim() : "";
    setFinderFrame(ra, dec, name);
    toast("Finder Chart centrado en RA "+ra.toFixed(4)+"°, Dec "+dec.toFixed(4)+"°.");
  });
  var centerBtn=$("centerMapBtn");
  if(centerBtn) centerBtn.addEventListener("click", function(){
    var ra=parseCoord($("raInput").value, true), dec=parseCoord($("decInput").value, false);
    if(isNaN(ra)||isNaN(dec)||dec<-90||dec>90){
      toast("Primero escribe unas coordenadas válidas arriba, en “Ve a un punto exacto del cielo”.");
      return;
    }
    ra=((ra%360)+360)%360;
    var name=$("coordName") ? $("coordName").value.trim() : "";
    setFinderFrame(ra, dec, name);
    toast("Mapa centrado en RA "+ra.toFixed(4)+"°, Dec "+dec.toFixed(4)+"°.");
  });

  /* ===== GALERÍA ===== */
  var gal=$("gal"), modal=$("modal"), modalImg=$("modalImg"), modalCap=$("modalCap");
  function openModal(d){ modalImg.src=d.src; modalImg.alt=d.alt; modalCap.textContent=d.titulo+" — Crédito: "+d.credito; modal.classList.add("open"); $("modalClose").focus(); }
  function closeModal(){ modal.classList.remove("open"); }
  $("modalClose").addEventListener("click", closeModal);
  modal.addEventListener("click", function(e){ if(e.target===modal) closeModal(); });
  document.addEventListener("keydown", function(e){ if(e.key==="Escape"){ closeModal(); var ep=$("editPanel"); ep.classList.remove("open"); ep.setAttribute("inert",""); } });
  var catLabel={cielo:"EL CIELO", telescopio:"EL TELESCOPIO", ilustracion:"ILUSTRACIÓN"};
  gal.innerHTML="";
  imgs.forEach(function(d){
    var fig=document.createElement("figure"); fig.setAttribute("data-cat", d.cat||"cielo");
    var btn=document.createElement("button"); btn.setAttribute("aria-label","Ampliar imagen: "+d.titulo);
    var im=document.createElement("img"); im.src=d.src; im.alt=d.alt; btn.appendChild(im);
    btn.addEventListener("click", function(){ openModal(d); });
    var cap=document.createElement("figcaption");
    var b=document.createElement("b"); b.textContent=d.titulo;
    var s=document.createElement("span"); s.textContent=d.fecha+" · "+d.credito;
    var tag=document.createElement("span"); tag.className="tag"; tag.textContent=catLabel[d.cat]||"SPHEREx";
    cap.appendChild(b); cap.appendChild(s); cap.appendChild(document.createElement("br")); cap.appendChild(tag);
    fig.appendChild(btn); fig.appendChild(cap); gal.appendChild(fig);
  });
  document.querySelectorAll("[data-filter]").forEach(function(ch){
    ch.addEventListener("click", function(){
      document.querySelectorAll("[data-filter]").forEach(function(x){x.classList.remove("on");}); ch.classList.add("on");
      var f=ch.getAttribute("data-filter"), visible=0;
      gal.querySelectorAll("figure").forEach(function(fig){ var show=(f==="all"||fig.getAttribute("data-cat")===f); fig.style.display=show?"":"none"; if(show) visible++; });
      $("galEmpty").style.display=visible?"none":"";
    });
  });

  /* ===== FAQ — con <details>: la respuesta siempre se puede abrir, sin depender de clases ===== */
  var faq=$("faq");
  /* Quitar duplicadas por si la lista traía alguna repetida */
  var seenQ={}, uniqueQ=[];
  (C.preguntas||[]).forEach(function(q){ var k=(q.p||"").trim().toLowerCase(); if(k && !seenQ[k]){ seenQ[k]=1; uniqueQ.push(q); } });
  faq.innerHTML="";
  uniqueQ.forEach(function(q,i){
    var item=document.createElement("details"); item.className="faq-item"; if(i===0) item.setAttribute("open","");
    var btn=document.createElement("summary"); btn.className="faq-q";
    var label=document.createElement("span"); label.textContent=q.p;
    var chev=document.createElement("span"); chev.className="chev"; chev.textContent="+"; chev.setAttribute("aria-hidden","true");
    btn.appendChild(label); btn.appendChild(chev);
    var ans=document.createElement("div"); ans.className="faq-a"; ans.textContent=q.r;
    item.appendChild(btn); item.appendChild(ans); faq.appendChild(item);
  });

  /* ===== EQUIPO ===== */
  var team=$("team");
  function renderTeam(){
    team.innerHTML="";
    (C.equipo||[]).forEach(function(m){
      var card=document.createElement("article"); card.className="member";
      var av=document.createElement("div"); av.className="avatar"; av.textContent=m.iniciales; av.setAttribute("aria-hidden","true");
      var h=document.createElement("h3"); h.textContent=m.nombre; h.setAttribute("data-editable","");
      var r=document.createElement("p"); r.className="rol"; r.textContent=m.rol; r.setAttribute("data-editable","");
      var f=document.createElement("p"); f.textContent=m.frase; f.setAttribute("data-editable","");
      card.appendChild(av); card.appendChild(h); card.appendChild(r); card.appendChild(f); team.appendChild(card);
    });
    if(document.body.classList.contains("editing")) applyEditableState();
  }
  renderTeam();

  /* ===== MODO EDICIÓN ===== */
  var panel=$("editPanel"), fab=$("editFab"), editing=false;
  function applyEditableState(){
    document.querySelectorAll("[data-editable]").forEach(function(el){ el.contentEditable = editing ? "true" : "false"; el.spellcheck=false; });
  }
  function fillPanel(){
    $("edTitulo").value=C.tituloProyecto; $("edLema").value=C.lema; $("edSub").value=C.subtitulo;
    $("edCorreo").value=C.correoContacto; $("edContacto").value=C.textoContacto; $("edIrsa").value=C.irsaExplorer;
    var box=$("edTeam"); box.innerHTML="";
    (C.equipo||[]).forEach(function(m,i){
      var lab=document.createElement("label"); lab.textContent="Integrante "+(i+1)+" — nombre"; lab.setAttribute("for","edTeamName"+i);
      var inp=document.createElement("input"); inp.type="text"; inp.id="edTeamName"+i; inp.value=m.nombre; inp.setAttribute("data-team-name", i);
      var lab2=document.createElement("label"); lab2.textContent="Integrante "+(i+1)+" — rol"; lab2.setAttribute("for","edTeamRol"+i);
      var inp2=document.createElement("input"); inp2.type="text"; inp2.id="edTeamRol"+i; inp2.value=m.rol; inp2.setAttribute("data-team-rol", i);
      var lab3=document.createElement("label"); lab3.textContent="Integrante "+(i+1)+" — frase"; lab3.setAttribute("for","edTeamFrase"+i);
      var inp3=document.createElement("input"); inp3.type="text"; inp3.id="edTeamFrase"+i; inp3.value=m.frase; inp3.setAttribute("data-team-frase", i);
      box.appendChild(lab); box.appendChild(inp); box.appendChild(lab2); box.appendChild(inp2); box.appendChild(lab3); box.appendChild(inp3);
    });
    box.querySelectorAll("input").forEach(function(inp){
      inp.addEventListener("input", function(){
        var ni=inp.getAttribute("data-team-name"), ri=inp.getAttribute("data-team-rol"), fi=inp.getAttribute("data-team-frase");
        if(ni!==null){ C.equipo[Number(ni)].nombre=inp.value; C.equipo[Number(ni)].iniciales=inp.value.trim().slice(0,2).toUpperCase()||"EJ"; }
        if(ri!==null) C.equipo[Number(ri)].rol=inp.value;
        if(fi!==null) C.equipo[Number(fi)].frase=inp.value;
        renderTeam();
      });
    });
  }
  function syncFromPanel(){
    C.tituloProyecto=$("edTitulo").value; C.lema=$("edLema").value; C.subtitulo=$("edSub").value;
    C.correoContacto=$("edCorreo").value; C.textoContacto=$("edContacto").value; C.irsaExplorer=$("edIrsa").value.trim()||C.irsaExplorer;
    document.querySelectorAll("[data-cfg]").forEach(function(el){ var k=el.getAttribute("data-cfg"); if(C[k]!==undefined) el.textContent=C[k]; });
    setMail(); setIrsa(); document.title = C.tituloProyecto+" — El cielo que no se ve";
  }
  ["edTitulo","edLema","edSub","edCorreo","edContacto","edIrsa"].forEach(function(id){ $(id).addEventListener("input", syncFromPanel); });
  /* Capturar lo escrito directamente sobre la página */
  document.addEventListener("input", function(e){
    var el=e.target.closest ? e.target.closest("[data-cfg]") : null;
    if(el){ var k=el.getAttribute("data-cfg"); C[k]=el.textContent.trim(); fillPanelSoft(); }
  });
  function fillPanelSoft(){ if(panel.classList.contains("open")){ $("edTitulo").value=C.tituloProyecto; $("edLema").value=C.lema; $("edSub").value=C.subtitulo; } }
  fab.addEventListener("click", function(){
    var open=panel.classList.toggle("open"); fab.setAttribute("aria-expanded", open?"true":"false");
    if(open){ panel.removeAttribute("inert"); } else { panel.setAttribute("inert",""); }
    fab.textContent = open ? "✕ Cerrar editor" : "✏️ Editar esta página";
    if(open) fillPanel();
  });
  $("closePanelBtn").addEventListener("click", function(){ panel.classList.remove("open"); panel.setAttribute("inert",""); fab.textContent="✏️ Editar esta página"; fab.setAttribute("aria-expanded","false"); });
  $("toggleInlineEdit").addEventListener("click", function(){
    editing=!editing; document.body.classList.toggle("editing", editing); applyEditableState();
    this.textContent = editing ? "Dejar de editar textos (quedan puestos)" : "Editar textos en la página";
    toast(editing ? "Modo edición activo: toca cualquier texto con borde naranja y escribe." : "Textos actualizados en esta pestaña. Descarga tu copia para guardarlos.");
    if(editing){ panel.classList.remove("open"); panel.setAttribute("inert",""); window.scrollTo({top:0, behavior:"smooth"}); }
  });
  $("downloadBtn").addEventListener("click", function(){
    syncFromPanel();
    /* Sincronizar equipo editado a mano en la página */
    var members=team.querySelectorAll(".member");
    members.forEach(function(card,i){ if(C.equipo[i]){ var h=card.querySelector("h3"), r=card.querySelector(".rol"), ps=card.querySelectorAll("p"); if(h) C.equipo[i].nombre=h.textContent.trim(); if(r) C.equipo[i].rol=r.textContent.trim(); if(ps.length>1) C.equipo[i].frase=ps[1].textContent.trim(); } });
    var clone=document.documentElement.cloneNode(true);
    clone.querySelectorAll("[contenteditable]").forEach(function(el){ el.removeAttribute("contenteditable"); });
    var body=clone.querySelector("body"); if(body) body.classList.remove("editing");
    var p=clone.querySelector("#editPanel"); if(p) p.classList.remove("open");
    /* Hornear la configuración actual en el CONFIG del archivo descargado */
    var scripts=clone.querySelectorAll("script");
    var cfgScript=null; scripts.forEach(function(sc){ if(sc.src && sc.src.indexOf("config.js")!==-1) cfgScript=sc; });
    if(cfgScript){ cfgScript.textContent="\nwindow.CONFIG = "+JSON.stringify(C, null, 2)+";\n"; }
    var html="<!doctype html>\n"+clone.outerHTML;
    var blob=new Blob([html], {type:"text/html;charset=utf-8"});
    var a=document.createElement("a"); a.href=URL.createObjectURL(blob); a.download="planeta-x-y-spherex-editado.html";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function(){ URL.revokeObjectURL(a.href); }, 2000);
    toast("Descargado ✔ Ese archivo ya trae tus textos. Súbelo con la carpeta assets/ y listo.");
  });
})();
