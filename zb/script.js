(function(){
    const qs = s => document.querySelector(s);
    const qsa = s => Array.from(document.querySelectorAll(s));

    const state = {
        name: localStorage.getItem('bday_name') || 'My Favorite Man',
        message: localStorage.getItem('bday_msg') || 'Mere pasandida mard, tumhari muskurahat meri subah hai, tumhara saath meri raat. Aaj ke din, sirf itna kehna hai: I love you—today, tomorrow, always.',
        targetISO: localStorage.getItem('bday_target') || qs('#countdown')?.getAttribute('data-target-date') || new Date().toISOString(),
        musicOn: false
    };

    // Elements
    const elName = qs('#recipient-name');
    const elMessage = qs('#message');
    const elCountdown = qs('#countdown');
    const elMusic = qs('#bg-music');
    const musicToggle = qs('#music-toggle');
    const confettiBtn = qs('#confetti-btn');
    const openLetterBtn = qs('#open-letter');
    const letter = qs('#love-letter');
    const loader = qs('#loader');
    const enterBtn = qs('#enter-btn');
    const canvas = qs('#confetti-canvas');
    const ctx = canvas.getContext('2d');
    const sparkleCanvas = qs('#sparkle-canvas');
    const sctx = sparkleCanvas.getContext('2d');
    const memoriesGrid = document.querySelector('.memories-grid');
    const showcaseSources = document.querySelector('#showcase-sources');
    const showcaseTrack = document.querySelector('#showcase-track');
    const showcasePrev = document.querySelector('#showcase-prev');
    const showcaseNext = document.querySelector('#showcase-next');
    const showcasePlay = document.querySelector('#showcase-play');
    const showcaseFull = document.querySelector('#showcase-full');

    // Resize canvas
    function resizeCanvas(){
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        sparkleCanvas.width = window.innerWidth;
        sparkleCanvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Apply initial state
    function applyState(){
        if (elName) elName.textContent = state.name;
        if (elMessage) elMessage.textContent = state.message;
        renderCountdown();
    }

    // Countdown
    function getPartsUntil(target){
        const now = new Date();
        const diff = Math.max(0, target - now);
        const sec = Math.floor(diff / 1000);
        const days = Math.floor(sec / 86400);
        const hours = Math.floor((sec % 86400) / 3600);
        const minutes = Math.floor((sec % 3600) / 60);
        const seconds = sec % 60;
        return { days, hours, minutes, seconds };
    }

    function cell(num, label){
        return `<div class="cell"><div class="num">${String(num).padStart(2,'0')}</div><div class="label">${label}</div></div>`
    }

    function renderCountdown(){
        if (!elCountdown) return;
        let target;
        try { target = new Date(state.targetISO); } catch { target = new Date(); }
        const {days, hours, minutes, seconds} = getPartsUntil(target);
        elCountdown.innerHTML = [
            cell(days,'Days'),
            cell(hours,'Hours'),
            cell(minutes,'Minutes'),
            cell(seconds,'Seconds')
        ].join('');
    }

    if (elCountdown) setInterval(renderCountdown, 1000);

    // Confetti system (simple)
    const confettiPieces = [];
    function burstConfetti(amount = 150){
        for (let i = 0; i < amount; i++){
            confettiPieces.push({
                x: Math.random() * canvas.width,
                y: -10,
                vx: (Math.random() - 0.5) * 4,
                vy: Math.random() * 3 + 2,
                size: Math.random() * 6 + 4,
                color: `hsl(${Math.floor(Math.random()*360)}, 90%, 60%)`,
                rot: Math.random() * Math.PI,
                vr: (Math.random() - 0.5) * 0.2
            });
        }
    }

    function drawConfetti(){
        ctx.clearRect(0,0,canvas.width,canvas.height);
        for (const p of confettiPieces){
            p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.vy += 0.02;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
            ctx.restore();
        }
        // remove off-screen
        for (let i = confettiPieces.length - 1; i >= 0; i--){
            if (confettiPieces[i].y > canvas.height + 20) confettiPieces.splice(i,1);
        }
        requestAnimationFrame(drawConfetti);
    }
    drawConfetti();

    // Sparkle/starfield background
    const stars = [];
    for (let i=0;i<120;i++){
        stars.push({
            x: Math.random()*sparkleCanvas.width,
            y: Math.random()*sparkleCanvas.height,
            r: Math.random()*1.7 + 0.4,
            a: Math.random()*Math.PI*2,
            speed: Math.random()*0.2 + 0.05,
            tw: Math.random()*0.03 + 0.01
        });
    }
    let shooting = null;
    function drawSparkles(){
        sctx.clearRect(0,0,sparkleCanvas.width,sparkleCanvas.height);
        for (const st of stars){
            st.a += st.tw; if (st.a>Math.PI*2) st.a -= Math.PI*2;
            st.x += st.speed*0.2; if (st.x>sparkleCanvas.width) st.x = 0;
            const alpha = 0.3 + 0.7*(0.5+0.5*Math.sin(st.a));
            sctx.beginPath();
            sctx.fillStyle = `rgba(255,255,255,${alpha.toFixed(2)})`;
            sctx.arc(st.x, st.y, st.r, 0, Math.PI*2);
            sctx.fill();
        }
        // shooting star occasionally
        if (!shooting && Math.random()<0.004){
            shooting = {x: Math.random()*sparkleCanvas.width*0.5, y: Math.random()*sparkleCanvas.height*0.4, vx: 6+Math.random()*3, vy: 2+Math.random()*2, life: 0};
        }
        if (shooting){
            shooting.x += shooting.vx; shooting.y += shooting.vy; shooting.life += 1;
            sctx.strokeStyle = 'rgba(255,255,255,.8)';
            sctx.lineWidth = 2;
            sctx.beginPath();
            sctx.moveTo(shooting.x-30, shooting.y-10);
            sctx.lineTo(shooting.x, shooting.y);
            sctx.stroke();
            if (shooting.x > sparkleCanvas.width+40 || shooting.y > sparkleCanvas.height+40) shooting = null;
        }
        requestAnimationFrame(drawSparkles);
    }
    drawSparkles();

    // Floating hearts
    function spawnHeart(){
        const h = document.createElement('div');
        h.className = 'heart';
        h.style.left = Math.random()*100 + 'vw';
        h.style.bottom = '-20px';
        h.style.opacity = (Math.random()*0.6 + 0.3).toFixed(2);
        h.style.animationDuration = (Math.random()*3 + 3).toFixed(1) + 's';
        document.body.appendChild(h);
        setTimeout(()=>h.remove(), 6000);
    }
    setInterval(spawnHeart, 800);

    // Music controls
    function toggleMusic(){
        if (!elMusic) return;
        if (!state.musicOn){
            elMusic.play().then(()=>{
                state.musicOn = true;
                musicToggle.setAttribute('aria-pressed','true');
                musicToggle.textContent = 'Pause Music ❚❚';
            }).catch(()=>{
                // Autoplay might be blocked; ignore
            });
        } else {
            elMusic.pause();
            state.musicOn = false;
            musicToggle.setAttribute('aria-pressed','false');
            musicToggle.textContent = 'Play Music ♪';
        }
    }

    musicToggle?.addEventListener('click', toggleMusic);
    confettiBtn?.addEventListener('click', ()=> burstConfetti(200));
    openLetterBtn?.addEventListener('click', openLetter);
    qs('#letter-confetti')?.addEventListener('click', ()=> burstConfetti(300));

    // Settings form
    const form = qs('#settings-form');
    const inputName = qs('#input-name');
    const inputDate = qs('#input-date');
    const inputMessage = qs('#input-message');
    const resetBtn = qs('#reset-btn');
    const msgCount = qs('#msg-count');
    const preview = qs('#message-preview .preview-body');
    const copyBtn = qs('#copy-msg');

    // Initialize inputs with state
    if (inputName) inputName.value = state.name;
    if (inputMessage) inputMessage.value = state.message;
    function updatePreview(){
        if (!inputMessage) return;
        const value = inputMessage.value;
        if (msgCount) msgCount.textContent = String(value.length);
        if (preview) preview.textContent = value;
    }
    updatePreview();
    inputMessage?.addEventListener('input', updatePreview);

    copyBtn?.addEventListener('click', async ()=>{
        try{
            const text = inputMessage?.value || '';
            await navigator.clipboard.writeText(text);
            copyBtn.textContent = 'Copied ✓';
            setTimeout(()=> copyBtn.textContent = 'Copy Message', 1500);
        }catch(e){
            copyBtn.textContent = 'Copy Failed';
            setTimeout(()=> copyBtn.textContent = 'Copy Message', 1500);
        }
    });
    if (inputDate){
        // Normalize to local datetime-local format
        const d = new Date(state.targetISO);
        const pad = n => String(n).padStart(2,'0');
        const local = `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        inputDate.value = local;
    }

    form?.addEventListener('submit', e => {
        e.preventDefault();
        const newName = inputName?.value?.trim() || state.name;
        const newMsg = inputMessage?.value?.trim() || state.message;
        const newDateLocal = inputDate?.value || '';
        // Convert local datetime to ISO preserving local time intent
        let newISO = state.targetISO;
        if (newDateLocal){
            const [date, time] = newDateLocal.split('T');
            const [y,m,d] = date.split('-').map(Number);
            const [hh,mm] = time.split(':').map(Number);
            const localDate = new Date(y, m-1, d, hh, mm, 0);
            newISO = localDate.toISOString();
        }

        state.name = newName; state.message = newMsg; state.targetISO = newISO;
        localStorage.setItem('bday_name', newName);
        localStorage.setItem('bday_msg', newMsg);
        localStorage.setItem('bday_target', newISO);
        applyState();
        burstConfetti(120);
    });

    resetBtn?.addEventListener('click', ()=>{
        localStorage.removeItem('bday_name');
        localStorage.removeItem('bday_msg');
        localStorage.removeItem('bday_target');
        state.name = 'My Favorite Man';
        state.message = 'Mere pasandida mard, tumhari muskurahat meri subah hai, tumhara saath meri raat. Aaj ke din, sirf itna kehna hai: I love you—today, tomorrow, always.';
        state.targetISO = qs('#countdown')?.getAttribute('data-target-date') || new Date().toISOString();
        applyState();
    });

    // Kickoff
    applyState();
    // Show loader initially
    if (loader){
        document.body.style.overflow = 'hidden';
    }
    // Auto-open love letter once per device
    if (!localStorage.getItem('love_letter_shown')){
        setTimeout(()=>{ openLetter(); localStorage.setItem('love_letter_shown','1'); }, 2200);
    }

    // Modal helpers
    function openLetter(){
        if (!letter) return;
        letter.setAttribute('aria-hidden','false');
        document.addEventListener('keydown', onEscClose);
        letter.addEventListener('click', onBackdropClose);
        // Try to start music on user intent of opening letter
        if (!state.musicOn) toggleMusic();
        // Reveal paragraphs progressively for a creative reading experience
        const paras = Array.from(letter.querySelectorAll('.modal-content p'));
        paras.forEach(p=> p.classList.remove('reveal'));
        paras.forEach((p, i)=> setTimeout(()=> p.classList.add('reveal'), 200 + i*220));
    }
    function closeLetter(){
        if (!letter) return;
        letter.setAttribute('aria-hidden','true');
        document.removeEventListener('keydown', onEscClose);
        letter.removeEventListener('click', onBackdropClose);
    }
    function onEscClose(e){ if (e.key === 'Escape') closeLetter(); }
    function onBackdropClose(e){ if (e.target.hasAttribute('data-close')) closeLetter(); }
    qsa('[data-close]')?.forEach(el=> el.addEventListener('click', closeLetter));

    // Loader enter flow: start music, confetti, reveal page
    enterBtn?.addEventListener('click', ()=>{
        if (loader){
            loader.setAttribute('aria-hidden','true');
            document.body.style.overflow = '';
        }
        // Try to start music on user gesture
        if (!state.musicOn) toggleMusic();
        burstConfetti(260);
        setTimeout(()=> burstConfetti(120), 1000);
    });

    // Memories animations: observer to reveal on scroll and random seeds
    if (memoriesGrid){
        const figures = Array.from(memoriesGrid.querySelectorAll('figure'));
        figures.forEach((fig, idx)=>{
            fig.style.setProperty('--seed-rot', `${(Math.random()*6-3).toFixed(2)}deg`);
            fig.style.setProperty('--float-dur', `${(Math.random()*4+5).toFixed(1)}s`);
        });
        const io = new IntersectionObserver((entries)=>{
            entries.forEach(e=>{
                if (e.isIntersecting){
                    e.target.classList.add('in-view');
                    io.unobserve(e.target);
                }
            });
        }, {rootMargin:'-10% 0px -5% 0px', threshold: .15});
        figures.forEach(f=> io.observe(f));
    }

    // Build slideshow from hidden sources list
    let slides = [];
    let currentSlide = 0;
    let autoTimer = null;
    const AUTO_MS = 4000;

    function buildShowcase(){
        if (!showcaseTrack) return;
        const imgs = (showcaseSources ? showcaseSources.querySelectorAll('img') : (memoriesGrid ? memoriesGrid.querySelectorAll('img') : []));
        const vids = (showcaseSources ? showcaseSources.querySelectorAll('video') : []);
        showcaseTrack.innerHTML = '';
        slides = [];
        let processed = 0;
        const total = imgs.length + vids.length;
        function finalize(){
            if (processed < total) return;
            if (slides.length){
                activateSlide(0);
                if (slides.length > 1) startAuto();
            }
        }
        imgs.forEach((img)=>{
            const originalSrc = img.getAttribute('src');
            if (!originalSrc){ processed++; finalize(); return; }

            const tryBuild = (srcToUse) => {
                const temp = new Image();
                temp.onload = () => {
                    const slide = document.createElement('div');
                    slide.className = 'showcase-slide';
                    const slideImg = document.createElement('img');
                    slideImg.alt = img.alt || 'Memory';
                    slideImg.src = srcToUse;
                    slide.appendChild(slideImg);
                    showcaseTrack.appendChild(slide);
                    slides.push(slide);
                    processed++; finalize();
                };
                temp.onerror = () => {
                    // On first failure, toggle assets/ prefix
                    if (srcToUse.startsWith('assets/')){
                        if (srcToUse.replace(/^assets\//,'') !== originalSrc){
                            tryBuild(originalSrc);
                        } else { processed++; finalize(); }
                    } else {
                        const withAssets = `assets/${srcToUse}`;
                        if (withAssets !== srcToUse){
                            tryBuild(withAssets);
                        } else { processed++; finalize(); }
                    }
                };
                temp.src = srcToUse;
            };
            tryBuild(originalSrc);
        });
        vids.forEach((vid)=>{
            const originalSrc = vid.getAttribute('src');
            if (!originalSrc){ processed++; finalize(); return; }

            const tryBuildVideo = (srcToUse) => {
                const temp = document.createElement('video');
                temp.src = srcToUse;
                temp.preload = 'metadata';
                temp.onloadedmetadata = () => {
                    const slide = document.createElement('div');
                    slide.className = 'showcase-slide';
                    const slideVid = document.createElement('video');
                    slideVid.src = srcToUse;
                    slideVid.preload = 'auto';
                    slideVid.muted = true;
                    slideVid.playsInline = true;
                    slide.appendChild(slideVid);
                    showcaseTrack.appendChild(slide);
                    slides.push(slide);
                    processed++; finalize();
                };
                temp.onerror = () => {
                    if (srcToUse.startsWith('assets/')){
                        if (srcToUse.replace(/^assets\//,'') !== originalSrc){
                            tryBuildVideo(originalSrc);
                        } else { processed++; finalize(); }
                    } else {
                        const withAssets = `assets/${srcToUse}`;
                        if (withAssets !== srcToUse){
                            tryBuildVideo(withAssets);
                        } else { processed++; finalize(); }
                    }
                };
            };
            tryBuildVideo(originalSrc);
        });
        if (total === 0) finalize();
    }

    function activateSlide(idx){
        slides.forEach(s=> {
            s.classList.remove('is-active');
            const v = s.querySelector('video');
            if (v){ v.pause(); v.currentTime = 0; }
        });
        currentSlide = (idx + slides.length) % slides.length;
        const active = slides[currentSlide];
        active?.classList.add('is-active');
        const activeVideo = active?.querySelector('video');
        if (activeVideo){ activeVideo.play().catch(()=>{}); }
    }

    function nextSlide(){ activateSlide(currentSlide + 1); }
    function prevSlide(){ activateSlide(currentSlide - 1); }

    function startAuto(){
        stopAuto();
        autoTimer = setInterval(nextSlide, AUTO_MS);
        if (showcasePlay) showcasePlay.textContent = '❚❚';
    }
    function stopAuto(){
        if (autoTimer) clearInterval(autoTimer);
        autoTimer = null;
        if (showcasePlay) showcasePlay.textContent = '▶';
    }
    function toggleAuto(){ autoTimer ? stopAuto() : startAuto(); }

    showcasePrev?.addEventListener('click', ()=>{ prevSlide(); stopAuto(); });
    showcaseNext?.addEventListener('click', ()=>{ nextSlide(); stopAuto(); });
    showcasePlay?.addEventListener('click', toggleAuto);
    showcaseFull?.addEventListener('click', ()=>{
        const el = document.documentElement;
        if (!document.fullscreenElement){ el.requestFullscreen?.(); }
        else { document.exitFullscreen?.(); }
    });

    // Initialize showcase after DOM is ready
    buildShowcase();
})();


