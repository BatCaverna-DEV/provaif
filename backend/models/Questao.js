import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// Significado dos campos inteiros da tabela questoes
export const TIPO_QUESTAO = { OBJETIVA: 1, DISCURSIVA: 2 }
export const ACESSO_QUESTAO = { PRIVADA: 0, PUBLICA: 1 }
export const NIVEL_QUESTAO = { FACIL: 1, MEDIO: 2, DIFICIL: 3 }

const Questao = sequelize.define('Questao', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    tipo: DataTypes.INTEGER,
    acesso: DataTypes.INTEGER,
    nivel: DataTypes.INTEGER,
    assunto: DataTypes.STRING(100),
    texto: DataTypes.TEXT('long'),
}, {
    tableName: 'questoes',
    timestamps: false,
})

export default Questao
