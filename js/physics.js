const Physics = (function () {
    const R = 8.314; // J/(mol*K)

    // unit helpers
    function L_to_m3(L) { return L / 1000; }
    function m3_to_L(m3) { return m3 * 1000; }
    function kPa_to_Pa(kPa) { return kPa * 1000; }
    function Pa_to_kPa(Pa) { return Pa / 1000; }

    function displayState({ P, V, T }) {
        // dato uno stato in SI units ritorna un oggetto display {P (kPa), V (L), T (K)}
        return { P: Pa_to_kPa(P), V: m3_to_L(V), T };
    }

    function computeState(n, { P, V, T }) {
        // dato n e due tra P,V,T calcola il terzo
        // ritorna {P,V,T} in SI units (Pa, m3, K)
        if (n && P && T && V) console.log("Warning: all three parameters provided to computeState, ignoring T");
        if (n && P && V) T = P * V / (n * R);
        else if (n && P && T) V = n * R * T / P;
        else if (n && V && T) P = n * R * T / V;
        else throw new Error("Insufficient parameters to compute state");
        return { P, V, T };
    }

    const transformations = {
        isoterma: (start, end, gasparams, N) => {
            const n = gasparams.n;
            const T = start.T;
            end = computeState(n, { ...end, T: start.T });
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const V = start.V + (end.V - start.V) * (i / N);
                pts.push(computeState(n, { V, T }));
            }
            return pts;
        },
        isobara: (start, end, gasparams, N) => {
            const n = gasparams.n;
            const P = start.P;
            end = computeState(n, { ...end, P: start.P });
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const V = start.V + (end.V - start.V) * (i / N);
                pts.push(computeState(n, { V, P }));
            }
            return pts;
        },
        isocora: (start, end, gasparams, N) => {
            const n = gasparams.n;
            const V = start.V;
            end = computeState(n, { ...end, V: start.V });
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const P = start.P + (end.P - start.P) * (i / N);
                pts.push(computeState(n, { V, P }));
            }
            return pts;
        },
        adiabatica: (start, end, gasparams, N) => {
            const n = gasparams.n;
            const gamma = gasparams.gamma;
            const C = start.P * Math.pow(start.V, gamma);
            if (end.V) end = computeState(n, { V: end.V, P: C / Math.pow(end.V, gamma) });
            else if (end.P) end = computeState(n, { P: end.P, V: Math.pow(C / end.P, 1 / gamma) });
            else if (end.T) end = computeState(n, { T: end.T, V: Math.pow(start.T / end.T, 1 / (gamma - 1)) * start.V });
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const V = start.V + (end.V - start.V) * (i / N);
                const P = C / Math.pow(V, gamma);
                pts.push(computeState(n, { V, P }));
            }
            return pts;
        },
        lineare: (start, end, gasparams, N) => {
            const n = gasparams.n;
            const pts = [];
            for (let i = 0; i <= N; i++) {
                const t = i / N;
                const V = start.V + (end.V - start.V) * t;
                const P = start.P + (end.P - start.P) * t;
                pts.push(computeState(n, { V, P }));
            }
            return pts;
        },
    };
    const availableTransformations = Object.keys(transformations);

    function computeEnergy(path, gasparams) {
        if (!path || path.length < 2) return { W: [0], dU: [0], Q: [0] };
        const n = gasparams.n;
        const l = gasparams.freedom;

        let W = [];
        let dU = [];
        let Q = [];
        for (let i = 0; i < path.length - 1; i++) {
            const dV = path[i + 1].V - path[i].V;
            const dT = path[i + 1].T - path[i].T;
            W.push(0.5 * (path[i].P + path[i + 1].P) * dV);
            dU.push(0.5 * n * l * R * dT);
            Q.push(W[i] + dU[i]);
        }
        return { W, dU, Q };
    }

    function computeInternalEnergy(state, gasparams) {
        const n = gasparams.n;
        const l = gasparams.freedom;
        const T = state.T;
        return 0.5 * n * l * R * T;
    }

    function analyzeCycle(path, energies, gasparams, tolerance = 1e-3) {
        if (!path || path.length < 2 || !energies) return null;

        const start = path[0];
        const end = path[path.length - 1];

        // Verifica ciclo chiuso
        const isCyclic =
            Math.abs((end.P - start.P) / start.P) < tolerance &&
            Math.abs((end.V - start.V) / start.V) < tolerance &&
            Math.abs((end.T - start.T) / start.T) < tolerance;

        if (!isCyclic) return null;

        // Calcolo grandezze totali
        const Wtot = energies.W.reduce((a, b) => a + b, 0);
        const Qtot = energies.Q.reduce((a, b) => a + b, 0);

        let Qpos = 0;
        let Qneg = 0;
        for (const q of energies.Q) {
            if (q > 0) Qpos += q;
            else Qneg += q;
        }

        // Analisi tipo di ciclo
        const result = {
            isCyclic: true,
            Wtot,
            Qpos,
            Qneg,
            Qtot,
            rendimento: null,
            COP_frigo: null,
            COP_pompacalore: null,
            type: null,
        };

        if (Wtot > 0) {
            // Macchina termica
            result.type = "macchina termica";
            result.rendimento = Qpos > 0 ? Wtot / Qpos : null;
        } else if (Wtot < 0) {
            // Frigorifero / pompa di calore
            result.type = "ciclo frigorifero / pompa di calore";
            result.COP_frigo = Qneg < 0 ? Math.abs(Qneg / Wtot) : null;
            result.COP_pompacalore = Qpos > 0 ? Math.abs(Qpos / Wtot) : null;
        } else {
            result.type = "equilibrium / no net work";
        }

        return result;
    }



    function sample(type, start, end, gasparams, duration, sps = 60) {
        duration = Math.max(0.001, duration || 1); // s
        const N = Math.max(2, Math.round(duration * sps));

        if (!transformations[type]) {
            console.warn(`Transformation type "${type}" not recognized, using linear as fallback.`);
            type = 'linear';
        }

        return transformations[type](start, end, gasparams, N);
    }

    return {
        sample,
        computeState,
        availableTransformations,
        computeEnergy,
        computeInternalEnergy,
        analyzeCycle,
        convert: { displayState, L_to_m3, m3_to_L, kPa_to_Pa, Pa_to_kPa },
    };
})();
