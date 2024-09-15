import random
import os
import json
from datetime import datetime
from faker import Faker

faker = Faker()

prefixos_navio = ["MV", "MS", "SS", "RMS", "HMS", "USS"]

def gerar_nome_navio():
    prefixo = random.choice(prefixos_navio)
    nome_aleatorio = faker.company().upper()
    return f"{prefixo} {nome_aleatorio}"

def gerar_imo():
    return str(random.randint(10000000, 99999999))

def gerar_viagem():
    numero = random.randint(1000, 9999)
    ano = 2024
    return f"{numero}{ano}"

def gerar_data():
    return faker.date_this_year().strftime('%d%m%Y')

def gerar_hora():
    return faker.time().replace(':', '')

def gerar_tipo_escala():
    tipos = ['E', 'D', 'C', 'P', 'V']
    return random.choice(tipos)

def gerar_arquivo_evento():
    timestamp = datetime.now().strftime('%d%m%Y%H%M%S')

    evento = {
        "tipo": "EVENTOCRIACAOAVISOCHEGADA",
        "timestamp": timestamp,
        "navios": []
    }

    quantidade_navios = random.randint(1, 10)

    for _ in range(quantidade_navios):
        navio = {
            "viagem": gerar_viagem(),
            "imo": gerar_imo(),
            "nome_navio": gerar_nome_navio(),
            "data": gerar_data(),
            "hora": gerar_hora(),
            "tipo_escala": gerar_tipo_escala()
        }
        evento["navios"].append(navio)

    caminho_pasta = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'scriptsv2', 'arquivos', 'ecac'
    )
    
    if not os.path.exists(caminho_pasta):
        os.makedirs(caminho_pasta)

    nome_arquivo = os.path.join(caminho_pasta, f"ECAC{timestamp}.json")

    with open(nome_arquivo, 'w') as file:
        json.dump(evento, file, indent=4)

    print(f"Arquivo '{nome_arquivo}' gerado com sucesso!")

gerar_arquivo_evento()
