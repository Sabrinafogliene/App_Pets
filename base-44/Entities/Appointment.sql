{
  "name": "Appointment",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "date": {
      "type": "string",
      "format": "date-time",
      "description": "Data e hora da consulta"
    },
    "veterinarian": {
      "type": "string",
      "description": "Nome do veterinário"
    },
    "clinic_name": {
      "type": "string",
      "description": "Nome da clínica"
    },
    "reason": {
      "type": "string",
      "description": "Motivo da consulta"
    },
    "diagnosis": {
      "type": "string",
      "description": "Diagnóstico ou observações médicas"
    },
    "treatment": {
      "type": "string",
      "description": "Tratamento prescrito"
    },
    "attachments": {
      "type": "array",
      "items": {
        "type": "string"
      },
      "description": "URLs de anexos (exames, receitas, fotos)"
    },
    "cost": {
      "type": "number",
      "description": "Custo da consulta"
    },
    "status": {
      "type": "string",
      "enum": [
        "scheduled",
        "completed",
        "cancelled"
      ],
      "default": "scheduled",
      "description": "Status da consulta"
    }
  },
  "required": [
    "pet_id",
    "date",
    "veterinarian"
  ]
}