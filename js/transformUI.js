// transformUI.js — Gestione dell'interfaccia per la definizione delle trasformazioni

const TransformUI = (function () {
  let callbackAdd = null;
  let callbackChange = null;
  let currentStart = null;
  let firstEditable = true;

  // Riferimenti DOM
  const selTipo = $("#tipoTrasf");
  const inputP1 = $("#P1");
  const inputV1 = $("#V1");
  const inputT1 = $("#T1");
  const inputP2 = $("#P2");
  const inputV2 = $("#V2");
  const inputT2 = $("#T2");
  const inputDur = $("#durata");
  const inputFreedom = $("#freedom");
  const inputN = $("#nMol");
  const inputSPS = $("#sps");

  const tableBody = $("#tabellaTrasf tbody");
  const btnAggiornaGlobali = $("#btnAggiornaGlobali");
  const btnAdd = $("#btnAggiungi");
  const btnUndo = $("#btnUndo");
  const btnReset = $("#btnResetTrasf");

  // --- Inizializzazione ---
  function init(onAddedCallback, onChangedCallback) {
    callbackAdd = onAddedCallback;
    callbackChange = onChangedCallback;

    // Popola lista trasformazioni dal modulo Physics
    selTipo.empty();
    Physics.availableTransformations.forEach((k) => {
      selTipo.append(`<option value="${k}">${k}</option>`);
    });

    // Eventi
    btnAggiornaGlobali.on("click", updateGlobalParams);
    btnAdd.on("click", addTransformation);
    btnReset.on("click", resetAll);
    btnUndo.on("click", undoLast);

    disableStart(false); // la prima trasformazione può impostare P1, V1, T1
  }

  // --- Gestione abilitazione campi ---
  function disableStart(disable) {
    inputP1.prop("disabled", disable);
    inputV1.prop("disabled", disable);
    inputT1.prop("disabled", disable);
  }

  function updateGlobalParams() {
    if (!confirm("Aggiornare le proprietà globali resetterà il simulatore cancellando tutte le trasformazioni esistenti. Continuare?")) {
      return;
    }

    if (!window.AppState) return;
    const freedom = parseFloat(inputFreedom.val());
    const n = parseFloat(inputN.val());
    const gamma = (freedom + 2) / freedom;
    const sps = parseInt(inputSPS.val()) || 60;

    // Aggiorna lo stato globale
    window.AppState.gasparams = { freedom, n, gamma };
    window.AppState.sps = sps;
    resetAll();
  }

  // --- Aggiunge trasformazione ---
  function addTransformation() {
    if (!callbackAdd) return;

    // Lettura dati
    const type = selTipo.val();
    const durata = parseFloat(inputDur.val());

    // Stato iniziale
    let start = currentStart;
    if (firstEditable) {
      start = Physics.computeState(
        window.AppState.gasparams.n,
        {
          P: Physics.convert.kPa_to_Pa(parseFloat(inputP1.val())),
          V: Physics.convert.L_to_m3(parseFloat(inputV1.val())),
          T: parseFloat(inputT1.val()),
        }
      )
    }


    // Stato finale
    const P2 = inputP2.val() ? Physics.convert.kPa_to_Pa(parseFloat(inputP2.val())) : undefined;
    const V2 = inputV2.val() ? Physics.convert.L_to_m3(parseFloat(inputV2.val())) : undefined;
    const T2 = inputT2.val() ? parseFloat(inputT2.val()) : undefined;
    const end = { P: P2, V: V2, T: T2 };

    // callback verso main (ritorna i risultati completi)
    const result = callbackAdd({
      type,
      start,
      end,
      duration: durata,
    });

    if (!result) return;
    const { endState, energy } = result;

    // Aggiorna tabella
    addRow(start, type, endState, energy);

    // Aggiorna stato iniziale per prossima trasformazione
    currentStart = { ...endState };
    disableStart(true);
    firstEditable = false;
    inputP1.val((Physics.convert.Pa_to_kPa(endState.P)).toFixed(1));
    inputV1.val((Physics.convert.m3_to_L(endState.V)).toFixed(4));
    inputT1.val(endState.T.toFixed(1));

    // Reset valori di destinazione
    inputP2.val("");
    inputV2.val("");
  }

  // --- Inserisce una riga in tabella ---
  function addRow(start, type, end, energy) {
    const sDisp = Physics.convert.displayState(start);
    const eDisp = Physics.convert.displayState(end);

    const tr = $("<tr>");
    tr.append(
      `<td>P=${sDisp.P.toFixed(1)} kPa, V=${sDisp.V.toFixed(3)} L, T=${sDisp.T.toFixed(
        1
      )} K</td>`
    );
    tr.append(`<td>${type}</td>`);
    tr.append(
      `<td>P=${eDisp.P.toFixed(1)} kPa, V=${eDisp.V.toFixed(3)} L, T=${eDisp.T.toFixed(
        1
      )} K</td>`
    );
    tr.append(
      `<td>W=${energy.W.toFixed(2)} J, ΔU=${energy.dU.toFixed(2)} J, Q=${energy.Q.toFixed(
        2
      )} J</td>`
    );
    tableBody.append(tr);
  }

  // --- Annulla ultima trasformazione ---
  function undoLast() {
    tableBody.find("tr").last().remove();
    if (tableBody.children().length === 0) {
      resetAll();
    } else {
      // ripristina punto finale della nuova ultima trasformazione
      const last = AppState.processes.at(-1);
      currentStart = { ...last.start };
      inputP1.val((Physics.convert.Pa_to_kPa(last.start.P)).toFixed(1));
      inputV1.val((Physics.convert.m3_to_L(last.start.V)).toFixed(4));
      inputT1.val(last.start.T.toFixed(1));

      // rimuovi ultima trasformazione da AppState
      AppState.processes.pop();
      if (callbackChange) callbackChange();
    }
  }

  // --- Reset totale ---
  function resetAll() {
    tableBody.empty();
    disableStart(false);
    firstEditable = true;
    currentStart = null;
    inputP2.val("");
    inputV2.val("");
    inputT2.val("");
    if (AppState) AppState.processes = [];
    if (callbackChange) callbackChange();
  }

  return { init, resetAll };
})();
