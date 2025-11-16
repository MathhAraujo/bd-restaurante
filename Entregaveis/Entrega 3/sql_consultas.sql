-- Consultas Cliente:

SELECT * FROM Cliente;
SELECT * FROM Cliente WHERE cpf=?;

-- ? String formatada em %?% ex: %lucas%
SELECT * FROM Cliente WHERE nome like UPPER(?);


-- Consultas Reserva:

SELECT * FROM Reserva;
SELECT * FROM Reserva WHERE id_reserva=?;
SELECT * FROM Reserva WHERE cliente_cpf=?;

-- ? São variáveis de DATETIME para consulta no tempo específicado ex: '2025-10-11 19:30:00' e '2025-10-23 19:00:00'
SELECT nome, telefone, id_reserva, qnt_pessoas, data_hora_chegada FROM Cliente INNER JOIN Reserva ON cpf = cliente_cpf WHERE data_hora_chegada BETWEEN ? AND ? ORDER BY data_hora_chegada;

-- Ex cpf= 11122233344
SELECT * FROM Reserva WHERE cliente_cpf=? AND data_hora_chegada > NOW() ORDER BY data_hora_chegada;

-- Ex qnt_pessoas= 5
SELECT nome, telefone, id_reserva, qnt_pessoas, data_hora_chegada FROM Cliente INNER JOIN Reserva ON cpf = cliente_cpf WHERE data_hora_chegada > NOW() AND qnt_pessoas >= ? ORDER BY data_hora_chegada;


-- Consultas Data:

SELECT DAYNAME(data_hora_chegada) AS day, COUNT(id_reserva) AS num_reserva, SUM(qnt_pessoas) AS total_ppl FROM Reserva GROUP BY day ORDER BY total_ppl;
SELECT DATE_FORMAT(data_hora_chegada, '%Y-%m') AS mes_ano, COUNT(id_reserva) AS qnt FROM Reserva GROUP BY mes_ano ORDER BY mes_ano;
SELECT HOUR(data_hora_chegada) AS hora, COUNT(id_reserva) AS qnt_reservas FROM Reserva GROUP BY hora ORDER BY hora;
SELECT qnt_pessoas, COUNT(id_reserva) AS qnt_reserva FROM Reserva GROUP BY qnt_pessoas ORDER BY qnt_pessoas;
SELECT LEFT(telefone, 2) AS area, COUNT(cpf) as qnt_cliente FROM Cliente GROUP BY area ORDER BY area;