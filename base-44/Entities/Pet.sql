{
  "name": "Pet",
  "type": "object",
  "properties": {
    "nome": {
      "type": "string",
      "description": "Nome do pet"
    },
    "especie": {
      "type": "string",
      "enum": [
        "cao",
        "gato",
        "passaro",
        "coelho",
        "peixe",
        "reptil",
        "outro"
      ],
      "description": "Espécie do animal"
    },
    "raca": {
      "type": "string",
      "description": "Raça do animal"
    },
    "data_nascimento": {
      "type": "string",
      "format": "date",
      "description": "Data de nascimento"
    },
    "peso": {
      "type": "number",
      "description": "Peso atual em kg"
    },
    "sexo": {
      "type": "string",
      "enum": [
        "macho",
        "femea"
      ],
      "description": "Sexo do animal"
    },
    "url_foto": {
      "type": "string",
      "description": "URL da foto do pet"
    },
    "historico_medico": {
      "type": "string",
      "description": "Histórico médico e observações gerais"
    },
    "microchip": {
      "type": "string",
      "description": "Número do microchip"
    },
    "castrado": {
      "type": "boolean",
      "description": "Se o pet é castrado/esterilizado"
    }
  },
  "required": [
    "nome",
    "especie"
  ]
}