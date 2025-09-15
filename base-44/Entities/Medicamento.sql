{
  "name": "Medicamento",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "nome": {
      "type": "string",
      "description": "Nome do medicamento"
    },
    "dosagem": {
      "type": "string",
      "description": "Dosagem prescrita"
    },
    "frequencia": {
      "type": "string",
      "description": "Frequência de administração"
    },
    "data_inicio": {
      "type": "string",
      "format": "date",
      "description": "Data de início do tratamento"
    },
    "data_fim": {
      "type": "string",
      "format": "date",
      "description": "Data de fim do tratamento"
    },
    "vezes_ao_dia": {
      "type": "number",
      "description": "Quantas vezes por dia"
    },
    "horarios": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Horários específicos (ex: ['08:00', '20:00'])"
    },
    "veterinario_prescritor": {
      "type": "string",
      "description": "Veterinário que prescreveu"
    },
    "instrucoes": {
      "type": "string",
      "description": "Instruções especiais de uso"
    },
    "ativo": {
      "type": "boolean",
      "default": true,
      "description": "Se o tratamento está ativo"
    }
  },
  "required": [
    "pet_id",
    "nome",
    "dosagem",
    "data_inicio"
  ]
}