-- Anti Join
SELECT c.cpf, c.nome, c.telefone FROM Cliente AS c LEFT JOIN Reserva AS r ON c.cpf = r.cliente_cpf WHERE r.id_reserva IS NULL;

-- Full Outer Join
SELECT m.id_mesa, m.estado_mesa, r.id_reserva, r.data_hora_chegada FROM Mesa AS m LEFT JOIN Seleciona AS s ON m.id_mesa = s.id_mesa LEFT JOIN Reserva AS r ON s.id_reserva = r.id_reserva UNION SELECT m.id_mesa, m.estado_mesa, r.id_reserva, r.data_hora_chegada FROM Mesa AS m RIGHT JOIN Seleciona AS s ON m.id_mesa = s.id_mesa RIGHT JOIN Reserva AS r ON s.id_reserva = r.id_reserva ORDER BY id_mesa, id_reserva;

-- Subconsulta 1
SELECT c.nome, COUNT(r.id_reserva) AS total_reservas FROM Cliente AS c JOIN Reserva AS r ON c.cpf = r.cliente_cpf GROUP BY c.cpf HAVING total_reservas > (SELECT AVG(qnt) FROM (SELECT COUNT(id_reserva) AS qnt FROM Reserva GROUP BY cliente_cpf) AS medias) ORDER BY total_reservas DESC;

-- Subconsulta 2
SELECT DISTINCT s.id_mesa, c.nome, c.telefone FROM Senta AS s JOIN Cliente AS c ON s.cpf = c.cpf WHERE c.cpf IN (SELECT cliente_cpf FROM Reserva GROUP BY cliente_cpf HAVING COUNT(id_reserva) >= 2);