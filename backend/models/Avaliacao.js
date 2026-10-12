import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Avaliacao = sequelize.define('Avaliacao', {
    id: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        defaultValue: DataTypes.UUIDV4,
    },
    descricao: DataTypes.STRING(45),
    dataCriacao: DataTypes.DATEONLY,
    // Soma dos pontos das questões; recalculada pelo avaliacaoService a cada alteração
    totalPontos: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
    },
}, {
    tableName: 'avaliacoes',
    timestamps: false,
})

export default Avaliacao
