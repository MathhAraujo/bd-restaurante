create database restaurante;
use restaurante;

CREATE TABLE Cliente (
    cpf CHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone CHAR(11) NOT NULL UNIQUE,
    nascimento DATE NOT NULL
);

CREATE TABLE Reserva (
    id_reserva SMALLINT PRIMARY KEY AUTO_INCREMENT,
    cliente_cpf CHAR(11) NOT NULL,
    qnt_pessoas TINYINT NOT NULL,
    data_hora_chegada DATETIME NOT NULL,
    status_reserva SET('ABERTA', 'EM_ATENDIMENTO','CANCELADA') DEFAULT 'ABERTA',
    FOREIGN KEY (Cliente_Cpf) REFERENCES Cliente(Cpf) ON DELETE CASCADE,
    CHECK (qnt_pessoas > 0)
);

CREATE TABLE Funcionario (
    id_func SMALLINT PRIMARY KEY AUTO_INCREMENT,
    id_func_gerente SMALLINT,
    nome VARCHAR(100) NOT NULL,
    cpf CHAR(11) NOT NULL UNIQUE,
    sal_base DECIMAL(8, 2) NOT NULL,
    sal_comissao DECIMAL(6, 2) DEFAULT 0,
    turno SET('MANHA', 'TARDE', 'NOITE'),
    CHECK (sal_base > 0 AND sal_comissao >= 0)
    );

CREATE TABLE Gerente (
    id_func SMALLINT PRIMARY KEY,
    qnt_subordinados_max TINYINT DEFAULT 0,
    FOREIGN KEY (Id_Func) REFERENCES Funcionario(Id_Func) ON UPDATE CASCADE,
    CHECK (qnt_subordinados_max >= 0)
);

-- id_func_gerente para fk após a criação da tabela gerente
ALTER TABLE Funcionario ADD CONSTRAINT FOREIGN KEY (id_func_gerente) REFERENCES Gerente(id_func) ON DELETE SET NULL;

CREATE TABLE Garcom (
    id_func SMALLINT PRIMARY KEY,
    qnt_mesas_max TINYINT DEFAULT 0,
    FOREIGN KEY (Id_Func) REFERENCES Funcionario(Id_Func) ON UPDATE CASCADE,
    CHECK (qnt_mesas_max >= 0)
);

CREATE TABLE Supervisiona (
    id_func_supervisor SMALLINT NOT NULL,
    id_func_supervisionado SMALLINT NOT NULL,
    PRIMARY KEY (id_func_supervisor, id_func_supervisionado),
    FOREIGN KEY (id_func_supervisor) REFERENCES Gerente(id_func) ON UPDATE CASCADE,
    FOREIGN KEY (id_func_supervisionado) REFERENCES Gerente(id_func) ON UPDATE CASCADE
);

CREATE TABLE Mesa (
    id_mesa SMALLINT PRIMARY KEY AUTO_INCREMENT,
    id_func SMALLINT DEFAULT NULL,
    id_comanda SMALLINT DEFAULT NULL,
    id_reserva SMALLINT DEFAULT NULL,
    estado_mesa ENUM('LIVRE', 'OCUPADA', 'RESERVADA') NOT NULL DEFAULT 'LIVRE',
    capacidade TINYINT NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva) ON DELETE SET NULL,
    FOREIGN KEY (id_func) REFERENCES Garcom(id_func) ON DELETE SET NULL,
    CHECK (capacidade > 0)
);

CREATE TABLE Comanda (
    id_comanda SMALLINT PRIMARY KEY AUTO_INCREMENT,
    total DECIMAL(8, 2) DEFAULT 0,
    data_hora_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    estado_comanda SET('ABERTA', 'FECHADA', 'PAGA') NOT NULL DEFAULT 'ABERTA',
    CHECK (total >= 0)
);

-- id_comanda para fk após criação da tabela comanda
ALTER TABLE Mesa ADD CONSTRAINT FOREIGN KEY (id_comanda) REFERENCES Comanda(id_comanda) ON DELETE SET NULL;

CREATE TABLE Item (
    id_item SMALLINT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_uni DECIMAL(6, 2) NOT NULL DEFAULT 0,
    disponibilidade BOOLEAN DEFAULT TRUE,
    CHECK (preco_uni >= 0)
);

CREATE TABLE Alergenico (
    alergenico VARCHAR(50) PRIMARY KEY
);

CREATE TABLE Item_Alergenico (
    id_item SMALLINT NOT NULL,
    Alergenico VARCHAR(50) NOT NULL,
    PRIMARY KEY (id_item, alergenico),
    FOREIGN KEY (id_item) REFERENCES Item(id_item) ON DELETE CASCADE,
    FOREIGN KEY (alergenico) REFERENCES Alergenico(alergenico) ON DELETE CASCADE
);

CREATE TABLE Prato (
    id_item SMALLINT PRIMARY KEY,
    peso SMALLINT,
    qnt_porcoes TINYINT,
    FOREIGN KEY (id_item) REFERENCES Item(id_item) ON DELETE CASCADE,
    CHECK (peso > 0)
);

CREATE TABLE Bebida (
    id_item SMALLINT PRIMARY KEY,
    volume SMALLINT,
    teor_alcoolico TINYINT DEFAULT 0,
    marca VARCHAR(50),
    FOREIGN KEY (Id_Item) REFERENCES Item(Id_Item) ON DELETE CASCADE,
    CHECK (volume > 0 AND teor_alcoolico >= 0)
);

CREATE TABLE Solicitado (
    id_item SMALLINT NOT NULL,
    id_comanda SMALLINT NOT NULL,
    qnt TINYINT NOT NULL,
    PRIMARY KEY (id_item , id_comanda),
    FOREIGN KEY (id_item) REFERENCES Item (id_item) ON UPDATE CASCADE,
    FOREIGN KEY (id_comanda) REFERENCES Comanda (id_comanda)ON UPDATE CASCADE
);

CREATE TABLE Cliente_Total (
    id_registro INT AUTO_INCREMENT PRIMARY KEY,
    cpf_cliente CHAR(11),
    nome_cliente VARCHAR(100),
    total_gasto DECIMAL(10,2),
    data_atualizacao DATETIME
);

CREATE TABLE Reserva_Cancelada_Log (
    id_log INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva SMALLINT,
    cliente_cpf CHAR(11),
    novo_status VARCHAR(20) DEFAULT "CANCELADA",
    data_ocorrencia DATETIME
);

-- Índices

CREATE INDEX ndx_reserva_datahora
ON Reserva (data_hora_chegada);

CREATE INDEX ndx_reserva_cliente
ON Reserva (cliente_cpf);

CREATE INDEX ndx_mesa_estado
ON Mesa (estado_mesa);

CREATE INDEX ndx_funcionario_turno
ON Funcionario (turno);

-- Views

-- Reserva completa
CREATE OR REPLACE VIEW vw_reservas_completas AS
    SELECT r.id_reserva, r.cliente_cpf, c.nome AS nome_cliente, c.telefone AS telefone_cliente, r.qnt_pessoas, r.data_hora_chegada, r.status_reserva, m.id_mesa, m.estado_mesa, m.capacidade, g.id_func AS id_garcom, f.nome AS nome_garcom, f.turno AS turno_garcom
    FROM Reserva r
    JOIN Cliente c ON r.cliente_cpf = c.cpf
	LEFT JOIN Mesa m ON m.id_reserva = r.id_reserva
	LEFT JOIN Garcom g ON m.id_func = g.id_func
	LEFT JOIN Funcionario f ON g.id_func = f.id_func
    ORDER BY r.data_hora_chegada;

-- Mesas atualmente ocupadas completas
CREATE OR REPLACE VIEW vw_mesas_ocupadas_completas AS
	SELECT m.id_mesa, m.estado_mesa, m.capacidade, r.id_reserva, r.data_hora_chegada, r.status_reserva, c.cpf AS cliente_cpf, c.nome AS cliente_nome, c.telefone AS cliente_telefone, f.id_func AS id_garcom, f.nome AS nome_garcom, f.turno AS turno_garcom
	FROM Mesa m
	LEFT JOIN Reserva r ON m.id_reserva = r.id_reserva
	LEFT JOIN Cliente c ON r.cliente_cpf = c.cpf
	LEFT JOIN Garcom g ON m.id_func = g.id_func
	LEFT JOIN Funcionario f ON g.id_func = f.id_func
	WHERE m.estado_mesa = 'OCUPADA'
	ORDER BY r.data_hora_chegada;

-- Funções

-- Calculo de comissão do garçom
DELIMITER $$

CREATE FUNCTION fnc_calcula_comissao(p_id_comanda SMALLINT)
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

    IF v_estado = 'FECHADA' THEN
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

CREATE FUNCTION fnc_ocupacao()
RETURNS DECIMAL(5,2)
DETERMINISTIC
BEGIN
    DECLARE total_mesas INT;
    DECLARE mesas_ocupadas INT;
    DECLARE taxa DECIMAL(5,2);

    SELECT COUNT(*) INTO total_mesas FROM Mesa;
    SELECT COUNT(*) INTO mesas_ocupadas FROM Mesa WHERE estado_mesa = 'OCUPADA';

    IF total_mesas > 0 THEN
        SET taxa = (mesas_ocupadas / total_mesas) * 100;
    ELSE
        SET taxa = 0;
    END IF;

    RETURN taxa;
END$$

DELIMITER ;

-- Procedimentos

-- Aplica desconto na comanda inteira

DELIMITER $$

CREATE PROCEDURE prc_aplica_desconto(
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

DELIMITER $$

CREATE PROCEDURE prc_cliente_total()
BEGIN
    DECLARE done INT DEFAULT 0;
    DECLARE v_cpf CHAR(11);
    DECLARE v_nome VARCHAR(100);
    DECLARE v_total DECIMAL(10,2);

    DECLARE cur CURSOR FOR SELECT cpf, nome FROM Cliente;

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
        FROM Reserva r
        LEFT JOIN Mesa m ON m.id_reserva = r.id_reserva
        LEFT JOIN Comanda c ON c.id_comanda = m.id_comanda
        WHERE r.cliente_cpf = v_cpf;

        INSERT INTO Cliente_Total (cpf_cliente, nome_cliente, total_gasto, data_atualizacao)
        VALUES (v_cpf, v_nome, v_total, NOW());
    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;

-- Triggers

-- Registra na tabela de logs toda vez que uma reserva é cancelada
DELIMITER $$

CREATE TRIGGER trg_log_cancelamento_reserva
AFTER UPDATE ON Reserva
FOR EACH ROW
BEGIN
    IF NEW.status_reserva = 'CANCELADA' THEN
        INSERT INTO Reserva_Cancelada_Log (id_reserva, cliente_cpf, data_ocorrencia)
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