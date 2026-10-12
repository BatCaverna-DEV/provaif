import * as painelService from '../services/painelService.js'

// GET /painel/resumo — dados da tela principal do usuário logado
export async function resumo(req, res) {
    res.json(await painelService.resumo(req.usuario.id))
}
