//importScripts('https://www.gear-genomics.com/libs/js/lodash-4.17.15/lodash.min.js');
import _ from './lodash.min.js';

onmessage = function (event) {
  const result = generate(
    event.data.length,
    event.data.amount,
    event.data.candidates
  )
  postMessage(result)
}

function generate (length, amount, candidatesProvided) {
  const alphabet = 'ACGT'
  let candidates
  let barcodeLength

  if (candidatesProvided.length > 0) {
    candidates = candidatesProvided
    barcodeLength = candidates[0].length
  } else {
    barcodeLength = length
    candidates = alphabet.split('')
    for (let i = 1; i < barcodeLength; i += 1) {
      const newCandidates = []
      for (let j = 0; j < candidates.length; j += 1) {
        const seq = candidates[j]
        if (seq.length < 8 || (isBalanced(seq) && Math.random() > barcodeLength / 22)) {
          for (let k = 0; k < alphabet.length; k += 1) {
            newCandidates.push(seq + alphabet[k])
          }
        }
      }
      candidates = newCandidates
    }
  }

  if (candidates.length > 50000) {
    candidates.sort(function (s1, s2) {
      return entropy(s2) - entropy(s1)
    })
    candidates = candidates.splice(0, 50000)
  }

  if (amount >= candidates.length) {
    amount = candidates.length - 1
  }

  let barcodes = []
  let bestHamming = 0
  let bestBaseDist = 10
  let iterCount = 0
  let freqCheck = Math.max(1, Math.floor(10000 / amount))
  const startTimeS = (new Date()).getTime() / 1000

  while (true) {
    if (iterCount % freqCheck === 0) {
      const nowS = (new Date()).getTime() / 1000
      if (nowS > startTimeS + 20) {
        break
      }
    }

    const subset = _.sampleSize(candidates, amount)
    const distances = []
    for (let i = 0; i < subset.length - 1; i += 1) {
      for (let j = i + 1; j < subset.length; j += 1) {
        distances.push(hammingDistance(subset[i], subset[j]))
      }
    }
    const minHamming = _.min(distances)
    const baseDistSubset = baseDist(subset)

    if (minHamming > bestHamming || (minHamming === bestHamming && bestBaseDist > baseDistSubset)) {
      bestHamming = minHamming
      bestBaseDist = baseDistSubset
      barcodes = subset
      iterCount = 0
    } else {
      iterCount += 1
    }
  }
  
  return {
    barcodeCount: amount,
    barcodeLength,
    barcodes: barcodes,
    pairwiseHammingDistance: bestHamming, 
    squaredError: bestBaseDist,
    candidates: candidatesProvided.length > 0 ? 'user-provided' : 'random'
  }
}

function isBalanced (seq) {
  const countThreshold = seq.length / 2
  const counts = { A: 0, C: 0, G: 0, T: 0 }
  for (let i = 0; i < seq.length; i += 1) {
    counts[seq[i]] += 1
    if (counts[seq[i]] >= countThreshold) {
      return false
    }
  }
  return true
}

function entropy (seq) {
  const counter = {}
  for (const char of seq) {
    if (counter[char] === undefined) {
      counter[char] = 0
    }
    counter[char] += 1
  }
  let ret = 0
  for (const char in counter) {
    const freq = counter[char] / seq.length
    ret += freq * (Math.log(freq) / Math.log(2))
  }
  return ret === 0 ? 0 : -ret
}

function hammingDistance (s1, s2) {
  let d = 0
  for (let i = 0; i < s1.length; i += 1) {
    if (s1[i] !== s2[i]) {
      d += 1
    }
  }
  return d
}

function baseDist (seqs) {
  let error = 0
  const numSeqs = seqs.length
  const seqLength = seqs[0].length
  for (let i = 0; i < seqLength; i += 1) {
    const freqs = { A: 0, C: 0, G: 0, T: 0 }
    for (let j = 0; j < numSeqs; j += 1) {
      const seq = seqs[j]
      freqs[seq[i]] += 1
    }
    error += Math.pow(0.25 - freqs.A / numSeqs, 2) + Math.pow(0.25 - freqs.C / numSeqs, 2)
    error += Math.pow(0.25 - freqs.G / numSeqs, 2) + Math.pow(0.25 - freqs.T / numSeqs, 2)
  }
  return error / seqLength
}