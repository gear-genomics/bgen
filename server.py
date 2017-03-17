#! /usr/bin/env python

from flask import Flask, jsonify
from bgen import bgen

app = Flask(__name__, static_url_path='/static')


@app.route('/<int:blen>/<int:bcount>', methods=['GET'])
def generate(blen, bcount):
    bs = bgen(blen, bcount)
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
