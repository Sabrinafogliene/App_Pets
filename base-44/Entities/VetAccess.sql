{
  "name": "VetAccess",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "vet_email": {
      "type": "string",
      "description": "Email do veterinário"
    },
    "vet_name": {
      "type": "string",
      "description": "Nome do veterinário"
    },
    "access_granted_date": {
      "type": "string",
      "format": "date",
      "description": "Data que o acesso foi concedido"
    },
    "permissions": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "vaccinations",
          "appointments",
          "medications",
          "weight",
          "photos",
          "medical_history"
        ]
      },
      "description": "Permissões específicas concedidas"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Se o acesso está ativo"
    }
  },
  "required": [
    "pet_id",
    "vet_email",
    "vet_name"
  ]
}