/* global Mustache, XMLHttpRequest, c3 */

var submitButton = document.getElementById('submit-button')
submitButton.addEventListener('click', submit)
var spinnerHtml = '<i class="fa fa-spinner fa-pulse fa-3x fa-fw"></i>'
var resultsTemplate = document.getElementById('tmpl-results').innerHTML
Mustache.parse(resultsTemplate)

function submit () {
  var bcLength = document.getElementById('bc-length').value
  var bcCount = document.getElementById('bc-count').value
  var req = new XMLHttpRequest()
  req.addEventListener('load', displayResults)
  req.open('GET', '/bgen/' + bcLength + '/' + bcCount)
  req.send()
  document.getElementById('results').innerHTML = spinnerHtml
}

function displayResults () {
  var results = JSON.parse(this.responseText)
  results.squaredError = results.squaredError.toFixed(4)
  var frequencies = getFrequencies(results.barcodes)
  var resultsRendered = Mustache.render(resultsTemplate, results)
  document.getElementById('results').innerHTML = resultsRendered
  c3.generate({
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
    color: {
      pattern: ['#66c2a5', '#fc8d62', '#8da0cb', '#e78ac3']
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
          format: function (x) { return x + 1 }
        }
      }
    }
  })
}

function getFrequencies (sequences) {
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
    for (let j = 0; j < num; j += 1) {
      var seq = sequences[j]
      counts[seq[i]] += 1
    }
    frequencies.A.push(counts.A / num)
    frequencies.C.push(counts.C / num)
    frequencies.G.push(counts.G / num)
    frequencies.T.push(counts.T / num)
  }
  return frequencies
}
