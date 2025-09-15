{
  "name": "Vacinacao",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "nome_vacina": {
      "type": "string",
      "description": "Nome da vacina"
    },
    "data_aplicacao": {
      "type": "string",
      "format": "date",
      "description": "Data da aplicação"
    },
    "proxima_dose": {
      "type": "string",
      "format": "date",
      "description": "Próxima data de reforço"
    },
    "veterinario": {
      "type": "string",
      "description": "Veterinário responsável"
    },
    "lote": {
      "type": "string",
      "description": "Lote da vacina"
    },
    "observacoes": {
      "type": "string",
      "description": "Observações sobre a vacina"
    },
    "status": {
      "type": "string",
      "enum": [
        "em_dia",
        "proximo_vencimento",
        "atrasada"
      ],
      "default": "em_dia",
      "description": "Status da vacina"
    }
  },
  "required": [
    "pet_id",
    "nome_vacina",
    "data_aplicacao"
  ]
}