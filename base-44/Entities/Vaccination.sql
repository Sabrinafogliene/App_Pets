{
  "name": "Vaccination",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "vaccine_name": {
      "type": "string",
      "description": "Nome da vacina"
    },
    "date_given": {
      "type": "string",
      "format": "date",
      "description": "Data da aplicação"
    },
    "next_due_date": {
      "type": "string",
      "format": "date",
      "description": "Próxima data de reforço"
    },
    "veterinarian": {
      "type": "string",
      "description": "Veterinário responsável"
    },
    "batch_number": {
      "type": "string",
      "description": "Lote da vacina"
    },
    "notes": {
      "type": "string",
      "description": "Observações sobre a vacina"
    },
    "status": {
      "type": "string",
      "enum": [
        "up_to_date",
        "due_soon",
        "overdue"
      ],
      "default": "up_to_date",
      "description": "Status da vacina"
    }
  },
  "required": [
    "pet_id",
    "vaccine_name",
    "date_given"
  ]
}