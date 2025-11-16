CREATE INDEX idx_reserva_datahora
ON Reserva (data_hora_chegada);

CREATE INDEX idx_reserva_cliente
ON Reserva (cliente_cpf);

CREATE INDEX idx_mesa_estado
ON Mesa (estado_mesa);

CREATE INDEX idx_funcionario_turno
ON Funcionario (turno);
