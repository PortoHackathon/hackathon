import os
import json
import re
from datetime import datetime
import requests


def validar_viagem(viagem):
    return bool(re.match(r'^\d{0,7}\d{4}$', viagem))

def validar_imo(imo):
    return bool(re.match(r'^\d{8}$', imo))

def validar_nome_navio(nome_navio):
    return isinstance(nome_navio, str) and len(nome_navio) <= 25

def validar_data(data):
    return bool(re.match(r'^\d{8}$', data))

def validar_hora(hora):
    return bool(re.match(r'^\d{6}$', hora))

def validar_tipo_escala(tipo_escala):
    return tipo_escala in ['E', 'D', 'C', 'P', 'V']

def validar_arquivo_ecac(arquivo_json):
    erros_gerais = []
    resultados = []
    total_erros = 0
    
    with open(arquivo_json, 'r') as file:
        try:
            dados = json.load(file)
        except json.JSONDecodeError:
            erros_gerais.append("Erro ao decodificar JSON")
            return {
                "nome_arquivo": os.path.basename(arquivo_json),
                "status": "Não foi enviado",
                "detalhe_erro": "Ocorreram 1 erros de validação.",
                "navios": []
            }

        if dados.get("tipo") != "EVENTOCRIACAOAVISOCHEGADA":
            erros_gerais.append("Tipo inválido")
        if not re.match(r'^\d{14}$', dados.get("timestamp", "")):
            erros_gerais.append("Timestamp inválido")

        for navio in dados.get("navios", []):
            erros_navio = []
            if not validar_viagem(navio.get("viagem", "")):
                erros_navio.append("Viagem inválida.")
            if not validar_imo(navio.get("imo", "")):
                erros_navio.append("IMO inválido.")
            if not validar_nome_navio(navio.get("nome_navio", "")):
                erros_navio.append("Nome do navio inválido.")
            if not validar_data(navio.get("data", "")):
                erros_navio.append("Data inválida.")
            if not validar_hora(navio.get("hora", "")):
                erros_navio.append("Hora inválida.")
            if not validar_tipo_escala(navio.get("tipo_escala", "")):
                erros_navio.append("Tipo de escala inválido.")
            
            resultado_navio = {
                "viagem": navio.get("viagem", ""),
                "imo": navio.get("imo", ""),
                "nome_navio": navio.get("nome_navio", "Desconhecido"),
                "data": navio.get("data", ""),
                "hora": navio.get("hora", ""),
                "tipo_escala": navio.get("tipo_escala", "")
            }

            if erros_navio:
                total_erros += len(erros_navio)
                resultado_navio.update({
                    "status": "Está com erro de formatação",
                    "detalhe_erro": " | ".join(erros_navio)
                })
            else:
                resultado_navio.update({
                    "status": "Enviado com sucesso",
                    "detalhe_erro": None
                })

            resultados.append(resultado_navio)

        if erros_gerais:
            total_erros += len(erros_gerais)
            status_arquivo = "Está com erro de formatação"
            detalhe_erro = f"Ocorreram {total_erros} erros de validação."
        elif any(res.get("status") == "Está com erro de formatação" for res in resultados):
            status_arquivo = "Falso"
            detalhe_erro = f"Ocorreram {total_erros} erros de validação."
        else:
            status_arquivo = "Enviado com sucesso"
            detalhe_erro = None
    
    return {
        "nome_arquivo": os.path.basename(arquivo_json),
        "status": status_arquivo,
        "detalhe_erro": detalhe_erro,
        "navios": resultados
    }

def validar_pasta_ecac(pasta_arquivos):
    resultados_sucesso = []
    resultados_erro = []
    
    for nome_arquivo in os.listdir(pasta_arquivos):
        caminho_arquivo = os.path.join(pasta_arquivos, nome_arquivo)
        if os.path.isfile(caminho_arquivo) and caminho_arquivo.endswith('.json'):
            resultado_validacao = validar_arquivo_ecac(caminho_arquivo)
            
            if resultado_validacao["status"] == "Enviado com sucesso":
                resultados_sucesso.append(resultado_validacao)
            else:
                resultados_erro.append(resultado_validacao)

    url = 'https://intranet.portodesantos.com.br/_json/porto_hoje.asp?tipo=programados2'
    response = requests.get(url)

    viagens_api = response.json()

    viagens_nao_encontradas = []
    
    for viagem in viagens_api:
        if viagem['viagem'].replace('/', '') not in [navio['viagem'] for navio in resultado_validacao['navios']]:
            viagens_nao_encontradas.append(viagem)
    
    return {
        "sucesso": resultados_sucesso,
        "erro": resultados_erro,
        "nao_encontradas": viagens_nao_encontradas
    }