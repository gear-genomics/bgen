#! /usr/bin/env python

from __future__ import print_function
import os
import collections
import numpy
import math
import itertools
import csv
import datetime
import random


def entropy(barcode):
    freqC = collections.Counter()
    for c in barcode:
        freqC[c] += 1
    freqList = []
    for c in freqC:
        freqList.append(float(freqC[c])/len(barcode))
    etr = 0.0
    for freq in freqList:
        etr += freq * math.log(freq, 2)
    return -etr


def hamming_distance(s1, s2):
    assert len(s1) == len(s2)
    return sum(ch1 != ch2 for ch1, ch2 in zip(s1, s2))


def basedist(bs):
    error = 0
    for pos in range(len(bs[0])):
        freqC = collections.Counter()
        for bl in bs:
            freqC[bl[pos]] += 1
        error += (0.25 - float(freqC['A'])/len(bs))*(0.25 - float(freqC['A'])/len(bs)) + (0.25 - float(freqC['C'])/len(bs))*(0.25 - float(freqC['C'])/len(bs))
        error += (0.25 - float(freqC['G'])/len(bs))*(0.25 - float(freqC['G'])/len(bs)) + (0.25 - float(freqC['T'])/len(bs))*(0.25 - float(freqC['T'])/len(bs))
    return error/len(bs[0])


# Read optional barcode file
def bgen(barlength, barcount, logfile=None, barfile=None):
    prel = 0
    barset = list()
    if barfile is not None:
        with open(barfile) as f:
            f_reader = csv.reader(f, delimiter="\t")
            for row in f_reader:
                if prel:
                    l = len(row[0])
                    if l != prel:
                        if logfile is not None:
                            print("Barcodes differ in length", file=logfile)
                        quit()
                else:
                    prel = len(row[0])
                barset.append(row[0])
        barlength = prel
        if barcount > len(barset):
            if logfile is not None:
                print("Not enough barcodes", file=logfile)
            quit()
    else:
        alphabet = ['A', 'C', 'G', 'T']
        for i in range(barlength):
            barsetnew = list()
            if len(barset):
                for b in barset:
                    if (len(b) < 8) or ((float(max(b.count('A'), b.count('C'), b.count('G'), b.count('T')))/float(len(b)) < 0.5) and (random.random() > float(barlength) / 22.0)):
                        for s in alphabet:
                            barsetnew.append(b+s)
                barset = barsetnew
            else:
                for s in alphabet:
                    barset.append(s)
    if logfile is not None:
        print("#Candidate Barcodes", len(barset), file=logfile)

    # Pre-filter by entropy
    if (len(barset) <= 50000):
        barset = numpy.array(barset)
    else:
        ent = list()
        for b in barset:
            ent.append(entropy(b))
        cutoff = sorted(ent, reverse=True)[50000]
        barsetnew = list()
        for i, b in enumerate(barset):
            if ent[i] > cutoff:
                barsetnew.append(b)
        barset = numpy.array(barsetnew)
    if logfile is not None:
        print("#Entropy filtered barcodes", len(barset), file=logfile)

    # Check number of barcodes
    if barcount >= len(barset):
        barcount = len(barset) - 1

    # Find good barcode combinations
    bestbarset = []
    bestham = 0
    bestbasedist = 10
    itercount = 0
    startdate = datetime.datetime.now()
    freqcheck = int(10000 / barcount)
    if freqcheck < 1:
        freqcheck = 1
    while (True):
        if (itercount % freqcheck == 0):
            if startdate + datetime.timedelta(seconds=20) < datetime.datetime.now():
                break
        indset = numpy.random.choice(len(barset), barcount, replace=False)
        minham = min([hamming_distance(e[0], e[1]) for e in itertools.combinations(barset[indset], 2)])
        if (minham > bestham) or ((minham == bestham) and (bestbasedist > basedist(barset[indset]))):
            bestham = minham
            bestbarset = barset[indset]
            bestbasedist = basedist(barset[indset])
            if logfile is not None:
                print(','.join(bestbarset), bestham, bestbasedist, itercount, file=logfile)
            itercount = 0
        else:
            itercount += 1
    return({'barset': bestbarset, 'minham': bestham, 'sqerr': bestbasedist})
