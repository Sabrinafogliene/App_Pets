{
  "name": "RegistroPeso",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "peso": {
      "type": "number",
      "description": "Peso em kg"
    },
    "data": {
      "type": "string",
      "format": "date",
      "description": "Data da pesagem"
    },
    "observacoes": {
      "type": "string",
      "description": "Observações sobre o peso"
    }
  },
  "required": [
    "pet_id",
    "peso",
    "data"
  ]
}