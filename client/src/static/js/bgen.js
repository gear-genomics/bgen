$('#mainTab a').on('click', function (e) {
  e.preventDefault()
  $(this).tab('show')
})

const submitButton = document.querySelector('#btn-submit')
const exampleButton = document.querySelector('#btn-example')
const inputLength = document.querySelector('#barcodeLength')
const inputAmount = document.querySelector('#barcodeAmount')
const inputCandidates = document.querySelector('#candidates')
const resultsContainer = document.querySelector('#results-container')
const resultSequences = document.querySelector('#barcode-sequences')
const sequenceStats = document.querySelector('#sequence-stats')
const notification = document.querySelector('#bgen-notification')
const error = document.querySelector('#bgen-error')
const errorMessage = document.querySelector('#error-message')
const resultLink = document.querySelector('#link-results')

submitButton.addEventListener('click', run)
exampleButton.addEventListener('click', showExample)

const worker = new Worker(new URL('./generateBarcodes.js', import.meta.url), { type: 'module' })

worker.onmessage = function (event) {
  const result = event.data
  hideElement(notification)
  displayResults(result)
}

function run () {
  const barcodeLength = Number.parseInt(inputLength.value, 10)
  const barcodeAmount = Number.parseInt(inputAmount.value, 10)
  const candidates = getCandidates()

  resultLink.click()

  if (candidates.length > 0) {
    inputLength.value = candidates[0].length
    if (!_.every(candidates, candidate => isDna(candidate))) {
      showError('candidate sequences can only contain characters A, C, G, T')
      return
    }
    if ((new Set(candidates.map(candidate => candidate.length))).size !== 1) {
      showError('candidate sequences must have the same length')
      return
    }
  }

  hideElement(error)
  showElement(notification)
  hideElement(resultsContainer)

  worker.postMessage({
    length: barcodeLength,
    amount: barcodeAmount,
    candidates
  })
}

function getCandidates () {
  const candidates = inputCandidates
    .value
    .split('\n')
    .filter(line => line !== '')
    .map(line => line.toUpperCase())

  return candidates
}

function showError (message) {
  hideElement(resultsContainer)
  showElement(error)
  errorMessage.textContent = `Error: ${message}`
}

function displayResults (result) {
  showElement(resultsContainer)
  const baseFrequencies = computeBaseFrequencies(result.barcodes)
  displaySequences(result.barcodes)
  displayStats(result)
  plotFrequencies(baseFrequencies)
}

function displaySequences (sequences) {
  resultSequences.textContent = sequences.join('\n')
}

function displayStats (result) {
  const t = `
    <table class="table table-striped">
      <tbody>
        <tr>
          <td>Length of barcodes</td>
          <td>${result.barcodeLength}</td>
        </tr>
        <tr>
          <td>Amount of barcodes</td>
          <td>${result.barcodeCount}</td>
        </tr>
        <tr>
          <td>Barcode candidates</td>
          <td>${result.candidates}</td>
        </tr>
        <tr>
          <td>Min. Hamming distance</td>
          <td>${result.pairwiseHammingDistance}</td>
        </tr>
        <tr>
          <td>Squared error</td>
          <td>${result.squaredError.toFixed(4)}</td>
        </tr>
      </tbody>
    </table>
  `
  sequenceStats.innerHTML = t
}

function computeBaseFrequencies (sequences) {
  const frequencies = {
    A: [],
    C: [],
    G: [],
    T: []
  }
  const len = sequences[0].length
  const num = sequences.length
  for (let i = 0; i < len; i += 1) {
    const counts = {
      A: 0,
      C: 0,
      G: 0,
      T: 0
    }
    for (let j = 0; j < num; j += 1) {
      const seq = sequences[j]
      counts[seq[i]] += 1
    }
    frequencies.A.push(counts.A / num)
    frequencies.C.push(counts.C / num)
    frequencies.G.push(counts.G / num)
    frequencies.T.push(counts.T / num)
  }
  return frequencies
}

function plotFrequencies (frequencies) {
  const data = []
  const bases = 'ACGT'
  for (let i = 0; i < bases.length; i += 1) {
    const base = bases[i]
    data.push({
      y: frequencies[base],
      x: frequencies[base].map(function (_, i) {
        return i + 1
      }),
      name: base,
      type: 'bar'
    })
  }

  const layout = {
    barmode: 'stack',
    title: 'Per-position base distribution',
    xaxis: {
      title: 'Position',
      tickvals: data[0].x
    },
    yaxis: {
      title: 'Frequency'
    }
  }

  Plotly.newPlot('frequency-chart', data, layout)
}

function showElement (element) {
  element.classList.remove('d-none')
}

function hideElement (element) {
  element.classList.add('d-none')
}

function isDna (seq) {
  const dnaPat = /^[acgt]+$/i
  return dnaPat.test(seq)
}

const exampleData = {
  barcodeCount: 8,
  barcodeLength: 10,
  barcodes: [
    'GTAGCGTAAC',
    'GATCGCACTT',
    'CTCTAACGGA',
    'GGCACAATTC',
    'CCTGATGTAG',
    'AAGGCTTCCA',
    'AGCCTCTAGT',
    'TACTAGATCG'
  ],
  pairwiseHammingDistance: 7,
  squaredError: 0.034375,
  candidates: 'random'
}

function showExample () {
  inputLength.value = exampleData.barcodeLength
  inputAmount.value = exampleData.barcodeCount
  setTimeout(() => {
    hideElement(error)
    resultLink.click()
    displayResults(exampleData)
  }, 400)
}