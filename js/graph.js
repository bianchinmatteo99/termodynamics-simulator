const Graph = (() => {
  const div = document.getElementById("plot");

  function init() {
    Plotly.newPlot(div, [], {
      xaxis: { title: "Volume (L)" },
      yaxis: { title: "Pressione (kPa)" },
      margin: { l: 60, r: 20, t: 30, b: 50 },
    });
  }

  function drawPath(path) {
    const trace = {
      x: path.map(p => p.V),
      y: path.map(p => p.P),
      mode: "lines",
      line: { color: "#007bff", width: 2 },
      name: "Trasformazioni"
    };
    const marker = {
      x: [path[0].V],
      y: [path[0].P],
      mode: "markers",
      marker: { color: "orange", size: 10 },
      name: "Stato"
    };
    Plotly.react(div, [trace, marker]);
  }

  function updateMarker(V, P) {
    Plotly.animate(div, { data: [{}, { x: [V], y: [P] }] },
      { transition: { duration: 0 }, frame: { duration: 0, redraw: false } });
  }

  return { init, drawPath, updateMarker };
})();
