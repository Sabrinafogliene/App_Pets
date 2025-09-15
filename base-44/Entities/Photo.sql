{
  "name": "Photo",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "photo_url": {
      "type": "string",
      "description": "URL da foto"
    },
    "title": {
      "type": "string",
      "description": "Título ou descrição da foto"
    },
    "date_taken": {
      "type": "string",
      "format": "date",
      "description": "Data em que a foto foi tirada"
    },
    "category": {
      "type": "string",
      "enum": [
        "medical",
        "fun",
        "milestone",
        "other"
      ],
      "default": "fun",
      "description": "Categoria da foto"
    }
  },
  "required": [
    "pet_id",
    "photo_url"
  ]
}