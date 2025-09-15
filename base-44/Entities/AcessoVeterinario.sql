{
  "name": "AcessoVeterinario",
  "type": "object",
  "properties": {
    "pet_id": {
      "type": "string",
      "description": "ID do pet"
    },
    "email_veterinario": {
      "type": "string",
      "description": "Email do veterinário"
    },
    "nome_veterinario": {
      "type": "string",
      "description": "Nome do veterinário"
    },
    "data_concessao": {
      "type": "string",
      "format": "date",
      "description": "Data que o acesso foi concedido"
    },
    "permissoes": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": [
          "vacinacoes",
          "consultas",
          "medicamentos",
          "peso",
          "fotos",
          "historico_medico"
        ]
      },
      "description": "Permissões específicas concedidas"
    },
    "ativo": {
      "type": "boolean",
      "default": true,
      "description": "Se o acesso está ativo"
    }
  },
  "required": [
    "pet_id",
    "email_veterinario",
    "nome_veterinario"
  ]
}