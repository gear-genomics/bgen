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
  console.log(results)
  var resultHtml =
    '<div>min. Hamming distance: ' + results.pairwiseHammingDistance + '</div>' +
    '<div>squared error: ' + results.squaredError.toFixed(4) + '</div>' +
    '<div>barcodes:<pre>' +
    results.barcodes.join('\n') +
    '</pre></div>'
  document.getElementById('results').innerHTML = resultHtml
}
