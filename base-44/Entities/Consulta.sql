{
  "name": "Consulta",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "data": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora da consulta"
    },
    "veterinario": {
      "type": "string",
      "description": "Nome do veterinário"
    },
    "nome_clinica": {
      "type": "string",
      "description": "Nome da clínica"
    },
    "motivo": {
      "type": "string",
      "description": "Motivo da consulta"
    },
    "diagnostico": {
      "type": "string",
      "description": "Diagnóstico ou observações médicas"
    },
    "tratamento": {
      "type": "string",
      "description": "Tratamento prescrito"
    },
    "anexos": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs de anexos (exames, receitas, fotos)"
    },
    "custo": {
      "type": "number",
      "description": "Custo da consulta"
    },
    "status": {
      "type": "string",
      "enum": [
        "agendada",
        "concluida",
        "cancelada"
      ],
      "default": "agendada",
      "description": "Status da consulta"
    }
  },
  "required": [
    "pet_id",
    "data",
    "veterinario"
  ]
}