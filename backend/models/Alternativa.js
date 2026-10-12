import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Alternativa = sequelize.define('Alternativa', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    // No DER é VARCHAR(250); virou TEXT para guardar conteúdo formatado (HTML com imagens, tabelas...)
    texto: DataTypes.TEXT,
    correta: DataTypes.INTEGER,
    // Não está no DER: posição da alternativa na questão (1 = a, 2 = b...).
    // Sem ela, a ordem das alternativas seria aleatória, pois o id é um UUID.
    ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'alternativas',
    timestamps: false,
})

export default Alternativa
