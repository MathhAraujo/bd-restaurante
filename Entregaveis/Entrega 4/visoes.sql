-- Reserva completa
CREATE OR REPLACE VIEW vw_reservas_detalhadas AS
SELECT r.id_reserva, r.data_hora_chegada, r.qnt_pessoas, r.cliente_cpf, r.mesa_id, r.funcionario_id, c.nome AS nome_cliente, c.telefone AS telefone_cliente, m.numero_mesa, m.estado_mesa, f.nome AS nome_funcionario, f.turno AS turno_funcionario FROM Reserva r
JOIN Cliente c ON r.cliente_cpf = c.cpf
JOIN Mesa m ON r.mesa_id = m.id_mesa
JOIN Funcionario f ON r.funcionario_id = f.id_funcionario;



-- Histórico das comandas
CREATE OR REPLACE VIEW vw_comandas_completas AS
SELECT c.id_comanda, c.total, c.estado_comanda, i.nome AS item, i.preco_uni, s.qnt AS quantidade, (i.preco_uni * s.qnt) AS subtotal, m.id_mesa, f.nome AS nome_garcom, f.turno FROM Comanda AS c
JOIN Cria AS cr ON c.id_comanda = cr.id_comandas
JOIN Mesa AS m ON cr.id_mesa = m.id_mesa
JOIN Garcom AS g ON m.id_func = g.id_func
JOIN Funcionario AS f ON g.id_func = f.id_func
JOIN Solicitado AS s ON c.id_comanda = s.id_comanda
JOIN Item AS i ON s.id_item = i.id_item
ORDER BY c.id_comanda;