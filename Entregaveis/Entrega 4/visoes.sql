-- Reserva completa
CREATE OR REPLACE VIEW vw_reservas_completas AS
    SELECT r.id_reserva, r.cliente_cpf, c.nome, r.qnt_pessoas, r.data_hora_chegada, r.status_reserva, m.id_mesa, m.status_mesa, m.capacidade, g.id_func
    FROM Reserva r
    JOIN Cliente c ON r.cliente_cpf = c.cpf
    LEFT JOIN Mesa m ON m.id_reserva = r.id_reserva
    LEFT JOIN Garcom g ON m.id_func = g.id_func
    LEFT JOIN Funcionario f ON g.id_func = f.id_func
    ORDER BY r.data_hora_chegada;

-- Mesas ocupadas completas
CREATE OR REPLACE VIEW vw_mesas_ocupadas_completas AS
    SELECT m.id_mesa, m.status_mesa, m.capacidade, r.id_reserva, r.data_hora_chegada, r.status_reserva, c.cpf, co.id_comanda, co.total
    FROM Mesa m
    LEFT JOIN Reserva r ON m.id_reserva = r.id_reserva
    LEFT JOIN Cliente c ON r.cliente_cpf = c.cpf
    LEFT JOIN Garcom g ON m.id_func = g.id_func
    LEFT JOIN Funcionario f ON g.id_func = f.id_func
    LEFT JOIN Comanda co ON m.id_mesa = co.id_mesa
    WHERE m.status_mesa = 'OCUPADA'
    ORDER BY r.data_hora_chegada;