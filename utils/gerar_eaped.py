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

def gerar_armazem():
    return str(random.randint(100, 999))

def gerar_data():
    return faker.date_this_year().strftime('%d%m%Y')

def gerar_hora():
    return faker.time().replace(':', '')

def gerar_tipo_escala():
    tipos = ['P', 'E', 'D']
    return random.choice(tipos)

def gerar_tipo_transitacao():
    tipos = ['CADASTRO', 'ATUALIZACAO']
    return random.choice(tipos)

def gerar_arquivo_atracacao():
    timestamp = datetime.now().strftime('%d%m%Y%H%M%S')

    atracao = {
        "tipo": "EVENTOPREVISAOATRACACAOCADASTROATUALIZACAO",
        "timestamp": timestamp,
        "atracoes": []
    }

    quantidade_atracoes = random.randint(1, 10)

    for _ in range(quantidade_atracoes):
        atracao_item = {
            "viagem": gerar_viagem(),
            "imo": gerar_imo(),
            "armazem": gerar_armazem(),
            "data": gerar_data(),
            "hora": gerar_hora(),
            "tipo": gerar_tipo_escala(),
            "tipo_transitacao": gerar_tipo_transitacao()
        }
        atracao["atracoes"].append(atracao_item)

    caminho_pasta = os.path.join(
        os.path.dirname(os.path.dirname(os.path.dirname(__file__))),
        'scriptsv2', 'arquivos', 'eaped'
    )
    
    if not os.path.exists(caminho_pasta):
        os.makedirs(caminho_pasta)

    nome_arquivo = os.path.join(caminho_pasta, f"EAPED{timestamp}.json")

    with open(nome_arquivo, 'w', encoding='utf-8') as file:
        json.dump(atracao, file, indent=4, ensure_ascii=False)

    print(f"Arquivo '{nome_arquivo}' gerado com sucesso!")

gerar_arquivo_atracacao()
