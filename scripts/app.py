from flask import Flask, jsonify, request
import requests
from funcoes.eaped import validar_pasta
from funcoes.ecac import validar_pasta_ecac
import os
import random

app = Flask(__name__)
from twilio.rest import Client

account_sid = 'ACecb1dfc116af00c2c5ba8510cdb551c9'
auth_token = 'a029db7857d3bccb65f56f7fe3bbe3c1'
client = Client(account_sid, auth_token)
mensagens = [
    'Notificação: Você possui RAPs a verificar',
    'Notificação: Você não possui RAPs a verificar'
]




@app.route('/validar_pasta_eaped', methods=['GET'])
def eaped():
    phone_number = request.args.get('phone_number')
    pasta_arquivos = os.path.join(os.path.dirname(__file__), 'arquivos', 'eaped')
    resultados = validar_pasta(pasta_arquivos)
    message = client.messages.create(
    from_='whatsapp:+14155238886',
    body=mensagens[random.randint(0,1)],
    to=f'whatsapp:+55{phone_number}'
    )
    print(message.sid)
    return jsonify(resultados)

@app.route('/validar_pasta_ecac', methods=['GET'])
def ecac():
    phone_number = request.args.get('phone_number')
    pasta_arquivos = os.path.join(os.path.dirname(__file__), 'arquivos', 'ecac')
    resultados = validar_pasta_ecac(pasta_arquivos)
    message = client.messages.create(
    from_='whatsapp:+14155238886',
    body=mensagens[random.randint(0,1)],
    to=f'whatsapp:+55{phone_number}'
    )
    print(message.sid)
    return jsonify(resultados)

if __name__ == '__main__':
    app.run(debug=True)
