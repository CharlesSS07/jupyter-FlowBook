#!/home/cmss/anaconda3/bin/python3

from flask import Flask, send_from_directory
app = Flask(__name__)

import os

folder = os.getcwd()

@app.route('/')
def hello_world():
    return 'Hello, World!'

@app.route('/nodebook/<path:path>')
def nodebook(path):
    return send_from_directory('/home/cmss/jupyter-nodes/nodebook-template/', path)

@app.route('/get-node')
def get_node():
    return 'node'
