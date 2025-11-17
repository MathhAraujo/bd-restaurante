-- Calculo de comissão do garçom
DELIMITER $$

CREATE FUNCTION calcula_comissao(p_id_comanda SMALLINT)
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE v_total DECIMAL(10,2);
    DECLARE v_estado VARCHAR(20);
    DECLARE v_comissao DECIMAL(10,2);

    SELECT total, estado_comanda 
    INTO v_total, v_estado
    FROM Comanda
    WHERE id_comanda = p_id_comanda;

    IF v_estado = 'fechada' THEN
        IF v_total < 100 THEN
            SET v_comissao = v_total * 0.10;
        ELSEIF v_total < 300 THEN
            SET v_comissao = v_total * 0.15;
        ELSE
            SET v_comissao = v_total * 0.20;
        END IF;
    ELSE
        SET v_comissao = 0;
    END IF;

    RETURN v_comissao;
END$$

DELIMITER ;

-- Calcula taxa de ocupação atual das mesas
DELIMITER $$

CREATE FUNCTION ocupacao()
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE total_mesas INT;
    DECLARE mesas_ocupadas INT;
    DECLARE taxa DECIMAL(5,2);

    SELECT COUNT(*) INTO total_mesas FROM Mesa;
    SELECT COUNT(*) INTO mesas_ocupadas FROM Mesa WHERE estado_mesa = 'ocupada';

    IF total_mesas > 0 THEN
        SET taxa = (mesas_ocupadas / total_mesas) * 100;
    ELSE
        SET taxa = 0;
    END IF;

    RETURN taxa;
END$$

DELIMITER ;