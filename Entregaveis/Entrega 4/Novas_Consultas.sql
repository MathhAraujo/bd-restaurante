-- Anti Join
-- Clientes que nunca fizeram uma reserva
SELECT c.cpf, c.nome, c.telefone FROM Cliente AS c LEFT JOIN Reserva AS r ON c.cpf = r.cliente_cpf WHERE r.id_reserva IS NULL;

-- Full Outer Join
-- Retorna informações associadas de clientes, mesas e reservas
(SELECT c.cpf, c.nome, r.id_reserva, r.data_hora_chegada AS data_reserva, m.id_mesa, m.status_mesa FROM Cliente AS c LEFT JOIN Reserva AS r ON c.cpf = r.cliente_cpf LEFT JOIN Mesa AS m ON m.id_reserva = r.id_reserva)
UNION
(SELECT c.cpf, c.nome, r.id_reserva, r.data_hora_chegada AS data_reserva, m.id_mesa, m.status_mesa FROM Cliente AS c RIGHT JOIN Reserva AS r ON c.cpf = r.cliente_cpf RIGHT JOIN Mesa AS m ON m.id_reserva = r.id_reserva)
ORDER BY cpf, id_reserva, id_mesa;

-- Subconsulta 1
-- Retorna clientes que possuem reservas em mesas acima da capacidade média
SELECT DISTINCT c.nome, c.telefone, m.id_mesa, m.capacidade FROM Cliente AS c JOIN Reserva AS r ON c.cpf = r.cliente_cpf JOIN Mesa AS m ON m.id_reserva = r.id_reserva WHERE m.capacidade > (SELECT AVG(capacidade) FROM Mesa) ORDER BY m.capacidade DESC;

-- Subconsulta 2
-- Retorna clientes que já cancelaram uma reserva
SELECT c.cpf, c.nome, c.telefone, r.id_reserva, r.qnt_pessoas, r.data_hora_chegada, r.status_reserva FROM Cliente c JOIN Reserva r ON r.cliente_cpf = c.cpf WHERE r.cliente_cpf IN (SELECT cliente_cpf FROM Reserva WHERE status_reserva = 'CANCELADA') AND r.status_reserva = 'CANCELADA';
