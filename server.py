#! /usr/bin/env python

from __future__ import print_function
from flask import Flask, jsonify
from bgen import bgen
import os
import uuid
import datetime

app = Flask(__name__, static_url_path='/static')

BGENDIR = os.path.dirname(os.path.abspath(__file__))

@app.route('/<int:blen>/<int:bcount>', methods=['GET'])
def generate(blen, bcount):
    if (blen >= 4) and (blen <= 16):
        if (bcount >= 2) and (bcount < 1000):
            uuidstr = str(uuid.uuid4())
            logfolder = os.path.join(BGENDIR, "data")
            sf = os.path.join(logfolder, uuidstr[0:2])
            if not os.path.exists(sf):
                os.makedirs(sf)
            logfile = os.path.join(sf, "bgen_" + uuidstr + ".log")
            with open(logfile, "w") as log:
                print("AnalysisStart", datetime.datetime.now().strftime("%d.%m.%y %H:%M:%S"), sep="\t", file=log)
                print("BarcodeLength", str(blen), sep="\t", file=log)
                print("BarcodeCount", str(bcount), sep="\t", file=log)
                bs = bgen(blen, bcount, logfile=log)
                print("HammingDistance", bs['minham'], sep="\t", file=log)
                print("SquaredError", bs['sqerr'], sep="\t", file=log)
                print("Barcodes", ','.join(bs['barset']), sep="\t", file=log)
                print("AnalysisEnd", datetime.datetime.now().strftime("%d.%m.%y %H:%M:%S"), sep="\t", file=log)
                return jsonify(
                    barcodeLength=blen,
                    barcodeCount=bcount,
                    barcodes=bs['barset'].tolist(),
                    pairwiseHammingDistance=bs['minham'],
                    squaredError=bs['sqerr']
                )


@app.route('/')
def root():
    return app.send_static_file('index.html')


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3300, debug=True, threaded=True)
