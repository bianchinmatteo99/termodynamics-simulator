$(function () {
  Graph.init();
  Animation.start();
  EnergyPanel.init();
  Timeline.init();
  TransformUI.init(onTransformationAdded, buildCombined);

  window.AppState = {
    processes: [],
    combinedPath: [],
    energyPath: [],
    gasparams: { freedom: 3, n: 1, gamma: 5 / 3 },
    sps: 60,
    maxvalues: { V: 1, T: 500, P: 100 },
  };

  // Callback dal modulo TransformUI
  function onTransformationAdded(proc, updateUI = true) {
    // Calcolo della trasformazione
    const points = Physics.sample(
      proc.type,
      proc.start,
      proc.end,
      AppState.gasparams,
      proc.duration,
      AppState.sps
    );

    // computeEnergy restituisce già un oggetto {W, dU, Q} per ogni intervallo
    const energy = Physics.computeEnergy(points, AppState.gasparams);
    const endState = points.at(-1);

    // Salvataggio nel processo
    const process = { ...proc, points, energy, end: endState };
    AppState.processes.push(process);

    // Aggiornamento combinato globale
    if (updateUI) buildCombined();

    // Restituisce lo stato finale e l’energia totale al modulo UI
    const total = { W: energy.W.reduce((a, b) => a + b, 0), dU: energy.dU.reduce((a, b) => a + b, 0), Q: energy.Q.reduce((a, b) => a + b, 0) };
    return { endState, energy: total };
  }


  // Combina tutti i punti e le energie in un unico percorso
  function buildCombined() {
    AppState.combinedPath = [];
    AppState.energyPath = { W: [], dU: [], Q: [] };
    let isfirst = true;
    for (const p of AppState.processes) {
      let s = isfirst ? 0 : 1;
      isfirst = false;

      const pts = p.points.map(Physics.convert.displayState).slice(s);
      AppState.combinedPath.push(...pts);
      AppState.energyPath.W.push(...p.energy.W);
      AppState.energyPath.dU.push(...p.energy.dU);
      AppState.energyPath.Q.push(...p.energy.Q);
    }

    const totalTime = AppState.processes.reduce((a, p) => a + p.duration, 0);
    Timeline.setMaxTime(totalTime);
    Timeline.setTotalFrames(AppState.combinedPath.length);

    AppState.maxvalues = AppState.combinedPath.reduce((acc, cur, i) => ({ V: Math.max(acc.V, cur.V), T: Math.max(acc.T, cur.T), P: Math.max(acc.P, cur.P) }), { V: 0, T: 0, P: 0 });

    Graph.drawPath(AppState.combinedPath);
    Timeline.reset();
    EnergyPanel.reset();

    const rend = document.getElementById("rendimento");
    const analysis = Physics.analyzeCycle(AppState.combinedPath, AppState.energyPath, AppState.gasparams);
    if (analysis && analysis.isCyclic) {
      const values = ["rendimento", "COP_frigo", "COP_pompacalore"].filter((key) => analysis[key] !== null).map((key) => `${key}: ${analysis[key].toFixed(2)}`).join(", ");
      rend.innerText = `Trasformazione ciclica: ${analysis.type} con ${values}`;
    } else {
      rend.innerText = "Trasformazione non ciclica";
    }
  }

  // Timeline listener per aggiornamento continuo
  Timeline.addTimeChangedListener((t, total, i) => {
    const state = AppState.combinedPath[i];
    const energy = { W: AppState.energyPath.W[i] || 0, dU: AppState.energyPath.dU[i] || 0, Q: AppState.energyPath.Q[i] || 0 };
    Graph.updateMarker(state.V, state.P);
    Animation.update(state, energy, AppState.maxvalues);

    const Wtot = AppState.energyPath.W.slice(0, i + 1).reduce((a, b) => a + b, 0);
    const Qpos = AppState.energyPath.Q.slice(0, i + 1).reduce((a, b) => Math.max(a, 0) + Math.max(b, 0), 0);
    const Qneg = -AppState.energyPath.Q.slice(0, i + 1).reduce((a, b) => Math.min(a, 0) + Math.min(b, 0), 0);
    const U = Physics.computeInternalEnergy(state, AppState.gasparams);
    EnergyPanel.update({ U, Qpos, Qneg, Wtot, Qdot: energy.Q, Wdot: energy.W });
  });


});
