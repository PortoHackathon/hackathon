import os
import json
import re
from datetime import datetime

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

def validar_arquivo(arquivo_json):
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
                "atracacoes": []
            }

        if dados.get("tipo") != "EVENTOPREVISAOATRACACAOCADASTROATUALIZACAO":
            erros_gerais.append("Tipo inválido")
        if not re.match(r'^\d{14}$', dados.get("timestamp", "")):
            erros_gerais.append("Timestamp inválido")

        for atracao in dados.get("atracoes", []):
            erros_atracao = []
            if not validar_viagem(atracao.get("viagem", "")):
                erros_atracao.append("Viagem inválida.")
            if not validar_imo(atracao.get("imo", "")):
                erros_atracao.append("IMO inválido.")
            if not validar_data(atracao.get("data", "")):
                erros_atracao.append("Data inválida.")
            if not validar_hora(atracao.get("hora", "")):
                erros_atracao.append("Hora inválida.")
            if not validar_tipo_escala(atracao.get("tipo", "")):
                erros_atracao.append("Tipo de escala inválido.")
            
            resultado_atracao = {
                "viagem": atracao.get("viagem", ""),
                "imo": atracao.get("imo", ""),
                "armazem": atracao.get("armazem", "Desconhecido"),
                "data": atracao.get("data", ""),
                "hora": atracao.get("hora", ""),
                "tipo": atracao.get("tipo", ""),
                "tipo_transitacao": atracao.get("tipo_transitacao", "Desconhecido")
            }

            if erros_atracao:
                total_erros += len(erros_atracao)
                resultado_atracao.update({
                    "status": "Está com erro de formatação",
                    "detalhe_erro": " | ".join(erros_atracao)
                })
            else:
                resultado_atracao.update({
                    "status": "Enviado com sucesso",
                    "detalhe_erro": None
                })

            resultados.append(resultado_atracao)

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
        "atracacoes": resultados
    }

def validar_pasta(pasta_arquivos):
    resultados_sucesso = []
    resultados_erro = []
    
    for nome_arquivo in os.listdir(pasta_arquivos):
        caminho_arquivo = os.path.join(pasta_arquivos, nome_arquivo)
        if os.path.isfile(caminho_arquivo) and caminho_arquivo.endswith('.json'):
            resultado_validacao = validar_arquivo(caminho_arquivo)
            
            if resultado_validacao["status"] == "Enviado com sucesso":
                resultados_sucesso.append(resultado_validacao)
            else:
                resultados_erro.append(resultado_validacao)
    
    return {
        "sucesso": resultados_sucesso,
        "erro": resultados_erro
    }
