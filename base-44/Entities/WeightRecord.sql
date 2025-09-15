{
  "name": "WeightRecord",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "weight": {
      "type": "number",
      "description": "Peso em kg"
    },
    "date": {
      "type": "string",
      "format": "date",
      "description": "Data da pesagem"
    },
    "notes": {
      "type": "string",
      "description": "Observações sobre o peso"
    }
  },
  "required": [
    "pet_id",
    "weight",
    "date"
  ]
}