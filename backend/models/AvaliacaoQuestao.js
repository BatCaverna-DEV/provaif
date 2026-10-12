import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

// Tabela associativa entre avaliações e questões (N:N), com a pontuação da questão na avaliação.
const AvaliacaoQuestao = sequelize.define('AvaliacaoQuestao', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    pontos: DataTypes.DECIMAL(10, 2),
    // Não está no DER: posição da questão na prova (1, 2, 3...).
    // Sem ela, a ordem das questões seria aleatória, pois o id é um UUID.
    ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
}, {
    tableName: 'avaliacoes_questoes',
    timestamps: false,
})

export default AvaliacaoQuestao
