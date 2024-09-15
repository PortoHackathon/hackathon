from flask import Flask, jsonify
import requests
from funcoes.eaped import validar_pasta
from funcoes.ecac import validar_pasta_ecac
import os

app = Flask(__name__)

@app.route('/validar_pasta_eaped', methods=['GET'])
def eaped():
    pasta_arquivos = os.path.join(os.path.dirname(__file__), 'arquivos', 'eaped')
    resultados = validar_pasta(pasta_arquivos)
    return jsonify(resultados)

@app.route('/validar_pasta_ecac', methods=['GET'])
def ecac():
    pasta_arquivos = os.path.join(os.path.dirname(__file__), 'arquivos', 'ecac')
    resultados = validar_pasta_ecac(pasta_arquivos)
    return jsonify(resultados)

if __name__ == '__main__':
    app.run(debug=True)
