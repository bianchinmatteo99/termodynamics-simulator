# Simulatore per le Trasformazioni Termodinamiche

**Laboratorio di Termodinamica** — Un simulatore interattivo e didattico per visualizzare e analizzare trasformazioni termodinamiche di gas ideali.

## 🎯 Obiettivo

Questo progetto è un'applicazione web didattica progettata per insegnanti e studenti di fisica e chimica. Permette di: 

- **Visualizzare** i diagrammi p–V (pressione-volume) di processi termodinamici
- **Simulare** il comportamento di un gas ideale durante diverse trasformazioni
- **Analizzare** l'energia scambiata (lavoro, calore, energia interna)
- **Studiare** cicli termodinamici e il rendimento di macchine termiche

## ✨ Caratteristiche

### Trasformazioni Disponibili

- **Isoterma**: Temperatura costante (T₁ = T₂)
- **Isobara**: Pressione costante (P₁ = P₂)
- **Isocora**: Volume costante (V₁ = V₂)
- **Adiabatica**: Senza scambio di calore (Q = 0)
- **Lineare**: Trasformazione lineare generica nel piano p–V

### Analisi Energetica

Per ogni trasformazione e ciclo, l'applicazione calcola:

- **Lavoro** (W): Energia scambiata con l'ambiente
- **Variazione di energia interna** (ΔU): Legata al cambiamento di temperatura
- **Calore** (Q): Energia termica scambiata (Q = W + ΔU)

Per cicli chiusi, l'app identifica automaticamente il tipo di ciclo e calcola:

- **Rendimento** di macchine termiche: η = W/Qₐₛₛ
- **COP frigorifero**: Coefficiente di prestazione per cicli di raffreddamento
- **COP pompa di calore**: Coefficiente di prestazione per cicli di riscaldamento

### Visualizzazione

- **Grafico p–V interattivo** con Plotly.js
- **Animazione 3D del pistone** con p5.js (volume, temperatura, pressione)
- **Diagramma energetico** che mostra l'evoluzione di W, ΔU, Q nel tempo
- **Timeline di riproduzione** con controlli play/pausa/velocità

## 🛠️ Tecnologie

| Componente | Tecnologia |
|---|---|
| **HTML/CSS** | Markup e stili responsivi |
| **JavaScript** | Logica di simulazione e interfaccia |
| **p5.js** | Grafica 2D e animazioni (pistone) |
| **Plotly.js** | Grafici interattivi (diagramma p–V) |
| **jQuery** | DOM manipulation e event handling |

**Composizione del codice**:
- JavaScript: 81.5%
- HTML: 11.1%
- CSS: 7.4%

## 📁 Struttura del Progetto

```
termodynamics-simulator/
├── index.html                # Pagina principale
├── css/
│   └── style.css             # Stili dell'interfaccia
├── js/
│   ├── main.js               # Orchestratore principale e state management
│   ├── physics.js            # Motore fisico (trasformazioni, energia, cicli)
│   ├── graph.js              # Diagramma p–V con Plotly.js
│   ├── animation.js          # Simulazione del pistone con p5.js
│   ├── energyPanel.js        # Pannello di analisi energetica
│   ├── transformUI.js        # Interfaccia di inserimento trasformazioni
│   └── timeline.js           # Timeline di riproduzione e scrubbing
└── README.md                 # Questo file
```

## 🚀 Come Usare

### Avvio dell'Applicazione

L'applicazione è una **SPA (Single Page Application)** che gira completamente nel browser. Nessun backend è necessario.

1. Aprire `index.html` in un browser moderno (Chrome, Firefox, Safari, Edge)
2. La pagina carica automaticamente gli script necessari da CDN

### Workflow Tipico

1. **Configura i parametri globali**:
   - Gradi di libertà (f): 3 per gas monoatomici, 5 per biatomici
   - Moli di gas (n): quantità di sostanza
   - Campionamento (sps): punti al secondo per la simulazione

2. **Inserisci lo stato iniziale**:
   - P₁, V₁, T₁ (almeno due valori; il terzo è calcolato con PV = nRT)

3. **Inserisci lo stato finale**:
   - P₂, V₂, T₂ (almeno uno; gli altri sono dedotti dalla trasformazione)

4. **Seleziona il tipo di trasformazione** e la durata

5. **Clicca "Aggiungi trasformazione"** per aggiungere il processo

6. **Riproduci** con i controlli della timeline per vedere l'evoluzione

7. **Analizza** i valori energetici nel pannello di destra

### Cicli Termodinamici

Aggiungi più trasformazioni consecutive per costruire un ciclo (es. ciclo di Otto, Carnot, etc.). L'app rileva automaticamente i cicli chiusi e calcola il rendimento.

## 🧮 Logica Fisica

### Modulo `physics.js`

Implementa:

- **Trasformazioni**: Genera i punti del percorso nello spazio degli stati
- **Equazione di stato**: PV = nRT (gas ideale)
- **Calcolo energetico**: 
  - Lavoro: W = ∫ P dV (approssimato numericamente)
  - Energia interna: U = (f/2) × n × R × T
  - Calore: Q = W + ΔU (primo principio della termodinamica)
- **Analisi di ciclo**: Riconosce cicli chiusi e calcola efficienze

### Parametri Fisici

- **Costante universale dei gas**: R = 8.314 J/(mol·K)
- **Unità di visualizzazione**: kPa, L, K
- **Unità SI interne**: Pa, m³, K

## 📊 Interfaccia

### Pannello Sinistro: Diagramma p–V

- Grafico interattivo del processo termodinamico
- Marcatore che si muove lungo il percorso durante la riproduzione
- Indicatore di cicli chiusi e rendimento

### Pannello Destro: Simulazione

- **Animazione del pistone**: Volume, temperatura e pressione visualizzati in tempo reale
- **Indicatori numerici**: Valori istantanei di T, P, V
- **Visualizzazione energetica**: Fiamme (calore in ingresso) o ghiaccio (calore in uscita)

### Pannello Inferiore: Controlli

- **Form di input** per inserire i parametri delle trasformazioni
- **Tabella** riassuntiva di tutti i processi aggiunti
- **Pulsanti** per aggiungere, annullare e resettare

### Timeline di Riproduzione

- **Slider temporale** per scorrere il processo
- **Pulsanti**: Play, Pausa, Reset
- **Loop**: Ripeti il ciclo continuamente
- **Velocità**: Regola la velocità di riproduzione

## 🎓 Casi d'Uso Didattici

### Per Insegnanti

- Dimostrare visivamente i concetti di trasformazioni termodinamiche
- Mostrare la relazione p–V e come cambia durante processi diversi
- Analizzare cicli termici reali (Otto, Diesel, Carnot)
- Discutere di rendimento e perdite energetiche

### Per Studenti

- Esercitarsi a calcolare stati iniziali e finali
- Comprendere l'energia scambiata in processi diversi
- Verificare predizioni teoriche con simulazioni
- Esplorare cicli termodinamici interattivamente

## ⚙️ Configurazione

### Gas Parameters

- **freedom**: Gradi di libertà (3 monoatomico, 5 biatomico, 6 poliatomico)
- **n**: Moli di gas
- **gamma**: γ = (f+2)/f (rapporto calori specifici, calcolato automaticamente)

### Numerics

- **sps** (samples per second): Risoluzione della simulazione
- **tolleranza**: Margine relativo per riconoscere cicli chiusi

## 🔧 Estensioni Possibili

- Aggiungere nuove trasformazioni (es. politropica)
- Supporto per gas reali con equazione di van der Waals
- Export dei dati (CSV, JSON)
- Simulazioni 3D avanzate con Three.js
- Calcolo di proprietà termodinamiche (entropia, entalpia)
- Comparazione tra cicli diversi

## 📝 Note di Sviluppo

### Moduli JavaScript

Ogni modulo è implementato come **IIFE (Immediately Invoked Function Expression)** o **module pattern** per isolare lo scope:

- `Physics`: Calcoli fisici e termodinamici
- `Graph`: Gestione del grafico Plotly
- `Animation`: Animazione p5.js del sistema
- `Timeline`: Controllo temporale e sincronizzazione
- `TransformUI`: Raccolta input dall'utente
- `EnergyPanel`: Visualizzazione e calcolo energie
- `AppState`: Stato globale dell'applicazione (in `main.js`)

### State Management

Lo stato è centralizzato in `AppState` (in `main.js`):

```javascript
AppState = {
  processes: [],           // Array di trasformazioni
  combinedPath: [],        // Percorso combinato di tutti i processi
  energyPath: { W, dU, Q }, // Vettori di energia
  gasparams: { ... },      // Parametri del gas
  maxvalues: { V, T, P }   // Valori max per normalizzazione
}
```

## 📦 Dipendenze Esterne

Caricate da CDN:

- [jQuery 3.6.4](https://code.jquery.com/)
- [Plotly.js 2.24.2](https://plot.ly/javascript/)
- [p5.js 1.6.0](https://p5js.org/)

## 🌐 Compatibilità

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 📄 Licenza

Non specificata. Contattare l'autore per informazioni sulla licenza.

## 👨‍💻 Autore

[bianchinmatteo99](https://github.com/bianchinmatteo99)

---

**Nota**: Questo progetto è stato creato a scopo didattico. Le simulazioni forniscono approssimazioni numeriche basate su modelli di gas ideale e non sostituiscono lo studio teorico.
