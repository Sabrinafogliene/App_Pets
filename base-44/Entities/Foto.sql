{
  "name": "Foto",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "url_foto": {
      "type": "string",
      "description": "URL da foto"
    },
    "titulo": {
      "type": "string",
      "description": "Título ou descrição da foto"
    },
    "data_foto": {
      "type": "string",
      "format": "date",
      "description": "Data em que a foto foi tirada"
    },
    "categoria": {
      "type": "string",
      "enum": [
        "medica",
        "diversao",
        "marco",
        "outra"
      ],
      "default": "diversao",
      "description": "Categoria da foto"
    }
  },
  "required": [
    "pet_id",
    "url_foto"
  ]
}