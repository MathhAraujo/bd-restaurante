-- Registra na tabela de logs toda vez que uma reserva é cancelada
CREATE TABLE Reserva_Cancelada_Log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva SMALLINT,
    cliente_cpf CHAR(11),
    novo_status VARCHAR(20) DEFAULT "cancelada",
    data_ocorrencia DATETIME
);

DELIMITER $$

CREATE TRIGGER trg_log_cancelamento_reserva
AFTER UPDATE ON Reserva
FOR EACH ROW
BEGIN
    IF NEW.status_reserva = 'cancelada' THEN
        INSERT INTO Reserva_Cancelada_Log (id_reserva, cliente_cpf, data_cancelamento)
        VALUES (NEW.id_reserva, NEW.cliente_cpf, NOW());
    END IF;
END $$

DELIMITER ;

-- Checa se a quantidade de subordinados de um gerente é menor que o max antes de adicionar
DELIMITER $$

CREATE TRIGGER trg_check_subordinados_max
BEFORE INSERT ON Supervisiona
FOR EACH ROW
BEGIN
    DECLARE total_subordinados INT;
    DECLARE limite_max INT;

    SELECT COUNT(*) INTO total_subordinados
    FROM Supervisiona
    WHERE id_func_supervisor = NEW.id_func_supervisor;

    SELECT qnt_subordinados_max INTO limite_max
    FROM Gerente
    WHERE id_func = NEW.id_func_supervisor;

    IF limite_max <= 0 OR total_subordinados >= limite_max THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Erro: este gerente já atingiu o número máximo de subordinados.';
    END IF;
END $$

DELIMITER ;

-- Adiciona o valor do item solicitado a comanda
DELIMITER $$

CREATE TRIGGER trg_atualiza_total_comanda
AFTER INSERT ON Solicitado
FOR EACH ROW
BEGIN
    DECLARE v_preco DECIMAL(10,2);
    DECLARE v_total_adicional DECIMAL(10,2);

    SELECT preco_uni
    INTO v_preco
    FROM Item
    WHERE id_item = NEW.id_item;

    SET v_total_adicional = v_preco * NEW.qnt;

    UPDATE Comanda
    SET total = total + v_total_adicional
    WHERE id_comanda = NEW.id_comanda;
END $$

DELIMITER ;

-- Checa se o funcionario a atender a mesa é garçom e se a quantidade de mesas do garçom é menor que o max antes de adicionar
DELIMITER $$

CREATE TRIGGER trg_check_garcom_max_mesas
BEFORE UPDATE ON Mesa
FOR EACH ROW
BEGIN
    DECLARE mesas_atribuidas INT;
    DECLARE limite_max TINYINT;

    IF OLD.id_func <> NEW.id_func AND NEW.id_func IS NOT NULL THEN

        IF EXISTS (SELECT 1 FROM Garcom WHERE id_func = NEW.id_func) THEN

            SELECT COUNT(*) INTO mesas_atribuidas
            FROM Mesa
            WHERE id_func = NEW.id_func;

            SELECT qnt_mesas_max INTO limite_max
            FROM Garcom
            WHERE id_func = NEW.id_func;

            IF mesas_atribuidas >= limite_max THEN
                SIGNAL SQLSTATE '45000'
                    SET MESSAGE_TEXT = 'Erro: este garçom já atingiu o número máximo de mesas.';
            END IF;
        END IF;
    END IF;
END $$

DELIMITER ;
