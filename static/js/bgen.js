const submitButton = document.querySelector('#btn-submit')
const exampleButton = document.querySelector('#btn-example')
const inputLength = document.querySelector('#barcodeLength')
const inputAmount = document.querySelector('#barcodeAmount')
const resultSequences = document.querySelector('#barcode-sequences')
const frequencyChart = document.querySelector('#frequency-chart')
const sequenceStats = document.querySelector('#sequence-stats')
const notification = document.querySelector('#bgen-notification')
 
submitButton.addEventListener('click', run)
exampleButton.addEventListener('click', showExample)

function run () {
  const barcodeLength = Number.parseInt(inputLength.value, 10)
  const barcodeAmount = Number.parseInt(inputAmount.value, 10)
  
  showElement(notification)
  hideElement(resultSequences)
  hideElement(frequencyChart)

  const result = generate(barcodeLength, barcodeAmount)
  setTimeout(() => {
    hideElement(notification)
    displayResults(result)
  }, 3500)
}

// FIXME port Python code
function generate (length, amount) {
  return exampleData
}

function displayResults (result) {
  baseFrequencies = computeBaseFrequencies(result.barcodes)
  displaySequences(result.barcodes)
  displayStats(result)
  plotFrequencies(baseFrequencies)
}

function displaySequences (sequences) {
  resultSequences.textContent = sequences.join('\n')
  showElement(resultSequences)
}

function displayStats (result) {
  let t = '<table class="table"><tbody>'
  t += '<tr><td>Min. Hamming distance</td><td>' + result.pairwiseHammingDistance + '</td></tr>'
  t += '<tr><td>Squared error</td><td>' + result.squaredError + '</td></tr>'
  t += '</tbody></table>'
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
      name: base,
      type: 'bar'
    })
  }

  const layout = {
    barmode: 'stack',
    xaxis: {
      title: 'Position'
    },
    yaxis: {
      title: 'Frequency'
    }
  }

  showElement(frequencyChart)
  Plotly.newPlot('frequency-chart', data, layout)
}

function showElement (element) {
  element.classList.remove('d-none')
  // element.classList.add('visible')
}

function hideElement (element) {
  element.classList.add('d-none')
  // element.classList.remove('visible')
}

const exampleData = {
  "barcodeCount": 8, 
  "barcodeLength": 10, 
  "barcodes": [
    "GTAGCGTAAC", 
    "GATCGCACTT", 
    "CTCTAACGGA", 
    "GGCACAATTC", 
    "CCTGATGTAG", 
    "AAGGCTTCCA", 
    "AGCCTCTAGT", 
    "TACTAGATCG"
  ], 
  "pairwiseHammingDistance": 7, 
  "squaredError": 0.034375
}

function showExample () {
  inputLength.value = exampleData.barcodeLength
  inputAmount.value = exampleData.barcodeCount
  displayResults(exampleData)
}
