var submitButton = document.getElementById('submit-button')
submitButton.addEventListener('click', submit)
var spinnerHtml = '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'

function submit() {
  var bcLength = document.getElementById('bc-length').value
  var bcCount = document.getElementById('bc-count').value
  var req = new XMLHttpRequest()
  req.addEventListener('load', displayResults)
  req.open('GET', '/' + bcLength + '/' + bcCount)
  req.send()
  document.getElementById('results').innerHTML = spinnerHtml
}

function displayResults() {
  var results = JSON.parse(this.responseText)
  var frequencies = getFrequencies(results.barcodes)
  console.log(results)
  var resultHtml =
    '<div>min. Hamming distance: ' + results.pairwiseHammingDistance + '</div>' +
    '<div>squared error: ' + results.squaredError.toFixed(4) + '</div>' +
    '<div>barcodes:<pre>' +
    results.barcodes.join('\n') +
    '</pre></div>' +
    '<div id="chart"></div>'
  document.getElementById('results').innerHTML = resultHtml
  var chart = c3.generate({
    bindto: '#chart',
    data: {
      columns: [
        ['A'].concat(frequencies.A),
        ['C'].concat(frequencies.C),
        ['G'].concat(frequencies.G),
        ['T'].concat(frequencies.T)
      ],
      type: 'bar',
      groups: [
        ['A', 'C', 'G', 'T']
      ]
    },
    axis: {
      y: {
        label: {
          text: 'Frequency',
          position: 'outer-top'
        },
        padding: 0
      },
      x: {
        label: {
          text: 'Position',
          position: 'outer-right'
        },
        tick: {
          format: function (x) { return x + 1; }
        }
      }
    }
  })
}

function getFrequencies(sequences) {
  var frequencies = {
    A: [],
    C: [],
    G: [],
    T: []
  }
  var len = sequences[0].length
  var num = sequences.length
  for (let i = 0; i < len; i += 1) {
    var counts = {
      A: 0,
      C: 0,
      G: 0,
      T: 0
    }
    for (let j = 0; j < num; j+= 1) {
      var seq = sequences[j]
      counts[seq[i]] += 1
    }
    frequencies.A.push(counts.A / num)
    frequencies.C.push(counts.C / num)
    frequencies.G.push(counts.G / num)
    frequencies.T.push(counts.T / num)
  }
  console.log(frequencies)
  return frequencies
}
