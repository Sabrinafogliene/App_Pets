{
  "name": "Medication",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "name": {
      "type": "string",
      "description": "Nome do medicamento"
    },
    "dosage": {
      "type": "string",
      "description": "Dosagem prescrita"
    },
    "frequency": {
      "type": "string",
      "description": "Frequência de administração"
    },
    "start_date": {
      "type": "string",
      "format": "date",
      "description": "Data de início do tratamento"
    },
    "end_date": {
      "type": "string",
      "format": "date",
      "description": "Data de fim do tratamento"
    },
    "times_per_day": {
      "type": "number",
      "description": "Quantas vezes por dia"
    },
    "times": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "Horários específicos (ex: ['08:00', '20:00'])"
    },
    "veterinarian": {
      "type": "string",
      "description": "Veterinário que prescreveu"
    },
    "instructions": {
      "type": "string",
      "description": "Instruções especiais de uso"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Se o tratamento está ativo"
    }
  },
  "required": [
    "pet_id",
    "name",
    "dosage",
    "start_date"
  ]
}