// Erro com status HTTP, tratado pelo middleware de erros (middlewares/errorHandler.js)
export default class HttpError extends Error {
    constructor(status, mensagem, detalhes) {
        super(mensagem)
        this.status = status
        this.detalhes = detalhes
    }
}
