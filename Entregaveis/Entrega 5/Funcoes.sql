-- Calculo de comissão do garçom
DELIMITER $$

CREATE FUNCTION fnc_calcula_comissao(valor DECIMAL(10,2))
RETURNS DECIMAL(10,2)
DETERMINISTIC
BEGIN
    DECLARE comissao DECIMAL(10,2);

    IF valor >= 300 THEN
        SET comissao = valor * 0.20;
    ELSEIF valor >= 200 THEN
        SET comissao = valor * 0.15;
    ELSE
        SET comissao = valor * 0.10;
    END IF;

    RETURN comissao;
END$$

DELIMITER ;

-- Calcula taxa de ocupação atual das mesas
DELIMITER $$

CREATE FUNCTION fnc_ocupacao()
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE total_mesas INT;
    DECLARE mesas_ocupadas INT;
    DECLARE taxa DECIMAL(5,2);

    SELECT COUNT(*) INTO total_mesas FROM Mesa;
    SELECT COUNT(*) INTO mesas_ocupadas FROM Mesa WHERE status_mesa = 'OCUPADA';

    IF total_mesas > 0 THEN
        SET taxa = (mesas_ocupadas / total_mesas) * 100;
    ELSE
        SET taxa = 0;
    END IF;

    RETURN taxa;
END$$

DELIMITER ;