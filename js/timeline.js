// timeline.js — Gestione temporale con supporto a frame rate target

const Timeline = (function () {
    // --- Stato interno ---
    let duration = 0;       // secondi totali (durata del ciclo completo)
    let currentTime = 0;    // tempo corrente in secondi
    let speed = 1;          // moltiplicatore velocità
    let looping = false;    // se true, riparte da capo
    let playing = false;    // se true, timeline attiva
    let lastTs = null;      // timestamp frame precedente

    let fpsTarget = 60;     // frame per secondo target (default 60)
    let totalFrames = 0;    // numero di frame equivalenti (opzionale)

    const listeners = [];   // array di funzioni da notificare ogni frame

    // --- API pubblica ---
    /** Inizializza la timeline. */
    function init() {
        // Controlli principali
        $("#playBtn").on("click", () => start());
        $("#pauseBtn").on("click", () => stop());
        $("#resetBtn").on("click", () => reset());

        $("#loopChk").on("change", (e) => setLoop(e.target.checked));
        $("#speedRng").on("input", (e) => setSpeed(parseFloat(e.target.value)));
        $("#timeSlider").on("input", (e) => { if (!playing) setPercentage(parseFloat(e.target.value)); });
    }

    /** Imposta la durata totale della timeline (in secondi). */
    function setMaxTime(seconds) {
        duration = Math.max(0, seconds);
        currentTime = 0;
        notify();
    }

    /** Imposta il frame rate target per la simulazione. */
    function setFrameRate(fps) {
        fpsTarget = Math.max(1, fps);
    }

    /** Imposta il numero totale di frame (equivalenti ai punti del dataset). */
    function setTotalFrames(nFrames) {
        totalFrames = Math.max(0, nFrames);
    }

    /** Imposta la velocità di avanzamento temporale. */
    function setSpeed(v) {
        speed = Math.max(0, v);
    }

    /** Imposta la modalità di loop (true = ciclica). */
    function setLoop(flag) {
        looping = !!flag;
    }

    /** Imposta manualmente il tempo corrente (in secondi). */
    function setCurrentTime(t) {
        currentTime = Math.max(0, Math.min(t, duration));
        notify();
    }

    /** Restituisce il tempo corrente (in secondi). */
    function getCurrentTime() {
        return currentTime;
    }

    /** Imposta la percentuale di avanzamento (0–1). */
    function setPercentage(p) {
        currentTime = Math.max(0, Math.min(p, 1)) * duration;
        notify();
    }

    /** Aggiunge un listener chiamato ogni volta che cambia il tempo. */
    function addTimeChangedListener(fn) {
        if (typeof fn === "function") listeners.push(fn);
    }

    /** Notifica tutti i listener del nuovo tempo. */
    function notify() {
        for (const fn of listeners) fn(currentTime, duration, getFrameIndex());
    }

    /** Avvia la timeline (animazione). */
    function start() {
        if (playing) return;
        playing = true;
        lastTs = null;
        requestAnimationFrame(step);
    }

    /** Ferma la timeline (pausa). */
    function stop() {
        playing = false;
    }

    /** Riporta la timeline all’inizio e ferma la riproduzione. */
    function reset() {
        playing = false;
        currentTime = 0;
        notify();
    }

    // --- loop interno principale ---
    function step(ts) {
        if (!playing) return;
        if (!lastTs) lastTs = ts;
        const dt = (ts - lastTs) / 1000; // secondi trascorsi
        lastTs = ts;

        // incremento coerente con velocità e frame rate target
        currentTime += dt * speed;

        // gestione loop e limiti
        if (currentTime >= duration) {
            if (looping && duration > 0) {
                currentTime %= duration;
            } else {
                currentTime = duration;
                playing = false;
            }
        }
        let p = getFraction();
        $("#timeSlider").val(p.toFixed(4));
        $("#timeLabel").text(`${(p * 100).toFixed(1)}% / 100%`);

        notify();
        requestAnimationFrame(step);
    }

    // --- utilità aggiuntive ---
    /** Restituisce la frazione temporale (0–1) dell'avanzamento. */
    function getFraction() {
        return duration > 0 ? currentTime / duration : 0;
    }

    /** Restituisce l’indice di frame più vicino (se usi frame discreti). */
    function getFrameIndex() {
        return totalFrames > 0 ? Math.round(getFraction() * (totalFrames - 1)) : 0;
    }

    return {
        setMaxTime,
        setFrameRate,
        setTotalFrames,
        setSpeed,
        setLoop,
        setCurrentTime,
        getCurrentTime,
        setPercentage,
        addTimeChangedListener,
        getFraction,
        getFrameIndex,
        start,
        stop,
        reset,
        init,
    };
})();
