-- Aplica desconto na comanda inteira

DELIMITER $$

CREATE PROCEDURE aplica_desconto(
    IN p_id_comanda SMALLINT,
    IN p_percentual DECIMAL(5,2)
)
BEGIN
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_novo_total DECIMAL(10,2);

    SELECT total INTO v_total
    FROM Comanda
    WHERE id_comanda = p_id_comanda;

    IF p_percentual > 0 AND p_percentual <= 100 THEN
        SET v_novo_total = v_total - (v_total * (p_percentual / 100));

        UPDATE Comanda
        SET total = v_novo_total
        WHERE id_comanda = p_id_comanda;
    END IF;
END$$

DELIMITER ;

-- Calcula total que o cliente já gastou no restaurante

CREATE TABLE Cliente_Total (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    cpf_cliente CHAR(11),
    nome_cliente VARCHAR(100),
    total_gasto DECIMAL(10,2),
    data_atualizacao DATETIME
);

DELIMITER $$

CREATE PROCEDURE cliente_total()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_cpf CHAR(11);
    DECLARE v_nome VARCHAR(100);
    DECLARE v_total DECIMAL(10,2);

    DECLARE cur CURSOR FOR
        SELECT cpf, nome FROM Cliente;

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = 1;

    DELETE FROM Cliente_Total;

    OPEN cur;

    read_loop: LOOP
        FETCH cur INTO v_cpf, v_nome;
        IF done THEN
            LEAVE read_loop;
        END IF;

        SELECT IFNULL(SUM(c.total), 0)
        INTO v_total
        FROM Comanda AS c
        JOIN Cria AS cr ON c.id_comanda = cr.id_comanda
        JOIN Senta AS s ON cr.id_mesa = s.id_mesa
        WHERE s.cpf = v_cpf;

        INSERT INTO Cliente_Total (cpf_cliente, nome_cliente, total_gasto, data_atualizacao)
        VALUES (v_cpf, v_nome, v_total, NOW());
    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;
