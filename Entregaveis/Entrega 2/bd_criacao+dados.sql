create database restaurante;
use restaurante;

CREATE TABLE Cliente (
    cpf CHAR(11) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    telefone CHAR(11) NOT NULL UNIQUE,
    data_nascimento DATE NOT NULL
);

CREATE TABLE Reserva (
    id_reserva SMALLINT PRIMARY KEY AUTO_INCREMENT,
    cliente_cpf CHAR(11) NOT NULL,
    qnt_pessoas TINYINT NOT NULL,
    data_hora_chegada DATETIME NOT NULL,
    status_reserva ENUM('ABERTA', 'EM_ATENDIMENTO', 'FECHADA', 'CANCELADA') DEFAULT 'ABERTA',
    FOREIGN KEY (cliente_Cpf) REFERENCES Cliente(Cpf) ON DELETE CASCADE,
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
    id_reserva SMALLINT DEFAULT NULL,
    status_mesa ENUM('LIVRE', 'OCUPADA', 'RESERVADA') NOT NULL DEFAULT 'LIVRE',
    capacidade TINYINT NOT NULL,
    FOREIGN KEY (id_reserva) REFERENCES Reserva(id_reserva) ON DELETE SET NULL,
    FOREIGN KEY (id_func) REFERENCES Garcom(id_func) ON DELETE SET NULL,
    CHECK (capacidade > 0)
);

CREATE TABLE Comanda (
    id_comanda SMALLINT PRIMARY KEY AUTO_INCREMENT,
    id_mesa SMALLINT NOT NULL,
    total DECIMAL(8, 2) DEFAULT 0,
    data_hora_criacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    status_comanda ENUM('ABERTA', 'FECHADA', 'PAGA') NOT NULL DEFAULT 'ABERTA',
    FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa),
    CHECK (total >= 0)
);

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
    FOREIGN KEY (id_Item) REFERENCES Item(Id_Item) ON DELETE CASCADE,
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

CREATE TABLE comanda_paga_log (
    id_log SMALLINT AUTO_INCREMENT PRIMARY KEY,
    id_comanda SMALLINT,
    cpf_cliente CHAR(11),
    nome_cliente VARCHAR(100),
    id_reserva SMALLINT,
    total_comanda DECIMAL(10,2),
    data_hora_criacao DATETIME,
    status_comanda VARCHAR(20),
    id_func_garcom SMALLINT,
    data_registro DATETIME
);


-- Índices

CREATE INDEX ndx_reserva_datahora
ON Reserva (data_hora_chegada);

CREATE INDEX ndx_reserva_cliente
ON Reserva (cliente_cpf);

CREATE INDEX ndx_status_mesa
ON Mesa (status_mesa);

CREATE INDEX ndx_funcionario_turno
ON Funcionario (turno);

-- Views

-- Reservas em abertas futuras completas
CREATE OR REPLACE VIEW vw_reservas_futuras_completas AS
    SELECT r.id_reserva, r.cliente_cpf, c.nome, r.qnt_pessoas, r.data_hora_chegada, r.status_reserva, m.id_mesa, m.status_mesa, m.capacidade, g.id_func
    FROM Reserva r
    JOIN Cliente c ON r.cliente_cpf = c.cpf
    LEFT JOIN Mesa m ON m.id_reserva = r.id_reserva
    LEFT JOIN Garcom g ON m.id_func = g.id_func
    LEFT JOIN Funcionario f ON g.id_func = f.id_func
    WHERE r.status_reserva = 'ABERTA' AND r.data_hora_chegada > NOW()
    ORDER BY r.id_reserva;

-- Mesas atualmente ocupadas completas
CREATE OR REPLACE VIEW vw_mesas_ocupadas_completas AS
    SELECT m.id_mesa, m.status_mesa, m.capacidade, r.id_reserva, r.qnt_pessoas ,r.data_hora_chegada, r.status_reserva, c.cpf, co.id_comanda, co.status_comanda, co.total
    FROM Mesa m
    LEFT JOIN Reserva r ON m.id_reserva = r.id_reserva
    LEFT JOIN Cliente c ON r.cliente_cpf = c.cpf
    LEFT JOIN Garcom g ON m.id_func = g.id_func
    LEFT JOIN Funcionario f ON g.id_func = f.id_func
    LEFT JOIN Comanda co ON m.id_mesa = co.id_mesa
    WHERE m.status_mesa = 'OCUPADA'
    ORDER BY m.id_mesa;
    
-- Funções

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

-- Procedimentos

-- Aplica desconto na comanda inteira
DELIMITER $$

CREATE PROCEDURE prc_aplica_desconto(
    IN p_id_comanda SMALLINT,
    IN p_percentual DECIMAL(5,2)
)
BEGIN
    IF p_percentual > 0 AND p_percentual <= 100 THEN
        UPDATE Comanda
        SET total = total - (total * (p_percentual / 100))
        WHERE id_comanda = p_id_comanda;
    END IF;
END$$

DELIMITER ;

-- Calcula total que o cliente já gastou no restaurante utilizando a tabela de logs
DELIMITER $$

CREATE PROCEDURE prc_cliente_total()
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

        SELECT IFNULL(SUM(l.total_comanda), 0)
        INTO v_total
        FROM comanda_paga_log AS l
        WHERE l.cpf_cliente = v_cpf;

        INSERT INTO Cliente_Total (cpf_cliente, nome_cliente, total_gasto, data_atualizacao)
        VALUES (v_cpf, v_nome, v_total, NOW());
    END LOOP;

    CLOSE cur;
END$$

DELIMITER ;


-- Triggers

-- Registra na tabela de logs toda vez que uma comanda é paga
DELIMITER $$

CREATE TRIGGER trg_comanda_paga_log
AFTER UPDATE ON Comanda
FOR EACH ROW
BEGIN
    IF NEW.status_comanda = 'PAGA' AND OLD.status_comanda <> 'PAGA' THEN
        
        INSERT INTO comanda_paga_log (
            id_comanda,
            cpf_cliente,
            nome_cliente,
            id_reserva,
            total_comanda,
            data_hora_criacao,
            status_comanda,
            id_func_garcom,
            data_registro
        )
        SELECT
            NEW.id_comanda,
            c.cpf,
            c.nome,
            r.id_reserva,
            NEW.total,
            NEW.data_hora_criacao,
            NEW.status_comanda,
            m.id_func,
            NOW()
        FROM Comanda co
        JOIN Mesa m ON m.id_mesa = co.id_mesa
        LEFT JOIN Reserva r ON r.id_reserva = m.id_reserva
        LEFT JOIN Cliente c ON c.cpf = r.cliente_cpf
        WHERE co.id_comanda = NEW.id_comanda;

    END IF;

END$$

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

-- Adiciona o valor da comissão do garçom ao total da comanda
DELIMITER $$

CREATE TRIGGER trg_adiciona_comissao
BEFORE UPDATE ON Comanda
FOR EACH ROW
BEGIN
    IF NEW.status_comanda = 'FECHADA'
       AND OLD.status_comanda = 'ABERTA' THEN
        SET NEW.total = NEW.total+ fnc_calcula_comissao(NEW.total);
    END IF;
END$$

DELIMITER ;



SET @now = NOW();

INSERT INTO Cliente (cpf, nome, telefone, data_nascimento) VALUES
('11111111101', 'Alice Costa Silva', '81990000001', '1990-05-15'),
('11111111102', 'Bruno Guedes Oliveira', '81990000002', '1985-11-20'),
('11111111103', 'Carla Dias Lima', '99990000003', '1992-03-10'),
('11111111104', 'Daniel Moreira Azevedo', '23990000004', '2000-07-01'),
('11111111105', 'Eduarda Rocha Martins', '25990000005', '1998-01-25'),
('11111111106', 'Fábio Nunes Almeida', '11990000006', '1982-09-30'),
('11111111107', 'Gabriela Lopes Ferreira', '91990000007', '1995-12-12'),
('11111111108', 'Heitor Sousa Barros', '51990000008', '1979-06-05'),
('11111111109', 'Isabela Carvalho Pinto', '81990000009', '2001-02-18'),
('11111111110', 'Julio Cesar Santos', '11990000010', '1993-10-08'),
('11111111111', 'Larissa Mendes Gomes', '81990000011', '1991-04-22'),
('11111111112', 'Marcos Vinicius Ribeiro', '23990000012', '1988-08-14'),
('11111111113', 'Natalia Pereira Castro', '51990000013', '1997-11-03'),
('11111111114', 'Otávio Barbosa Correia', '11990000014', '1980-03-29'),
('11111111115', 'Patrícia Fernandes Cunha', '91990000015', '1994-07-17'),
('11111111116', 'Rafael Araújo Duarte', '81990000016', '1999-01-05'),
('11111111117', 'Sofia Machado Farias', '25990000017', '1987-05-23'),
('11111111118', 'Thiago Viana Teles', '99990000018', '1996-09-09'),
('11111111119', 'Vanessa Monteiro Freire', '81990000019', '1983-12-27'),
('11111111120', 'William Pires Sampaio', '11990000020', '2002-04-16'),
('11111111121', 'Yasmin Caldeira Bentes', '51990000021', '1990-08-31'),
('11111111122', 'Zeca Amaral Bastos', '81990000022', '1986-02-07'),
('11111111123', 'Amanda Paiva Chaves', '99990000023', '1993-06-20'),
('11111111124', 'Breno Dantas Xavier', '23990000024', '1998-10-13'),
('11111111125', 'Clara Nogueira Esteves', '11990000025', '1984-01-09'),
('11111111126', 'Davi Mota Galvão', '91990000026', '1995-05-02'),
('11111111127', 'Elias Franco Peixoto', '81990000027', '2000-09-19'),
('11111111128', 'Fernanda Guerra Parente', '51990000028', '1989-12-01'),
('11111111129', 'Guilherme Neves Rebouças', '11990000029', '1992-04-25'),
('11111111130', 'Heloísa Tavares Vasconcelos', '81990000030', '1997-08-08'),
('11111111131', 'Igor Drummond Saraiva', '25990000031', '1981-11-16'),
('11111111132', 'Joana Rangel Quintela', '99990000032', '1994-02-28'),
('11111111133', 'Kevin Lira Ramalho', '81990000033', '1999-06-11'),
('11111111134', 'Lorena Simões Valente', '11990000034', '1986-10-24'),
('11111111135', 'Murilo Siqueira Brandão', '23990000035', '1991-01-03'),
('11111111136', 'Nicole Veloso Camargo', '51990000036', '1996-05-19'),
('11111111137', 'Oscar Bezerra Cordeiro', '81990000037', '1983-09-06'),
('11111111138', 'Pietra Sales Damasceno', '91990000038', '2001-12-30'),
('11111111139', 'Rodrigo Frota Gurgel', '11990000039', '1987-04-07'),
('11111111140', 'Stella Matos Jucá', '81990000040', '1990-08-18'),
('11111111141', 'Theo Lacerda Maciel', '99990000041', '1995-11-26'),
('11111111142', 'Ursula Queiroz Pacheco', '25990000042', '1988-02-14'),
('11111111143', 'Victor Távora Ximenes', '11990000043', '1993-06-03'),
('11111111144', 'Wendy Mourão Arraes', '81990000044', '1998-09-28'),
('11111111145', 'Xavier Nery Castelo', '51990000045', '1980-12-11'),
('11111111146', 'Yuri Lins Rabelo', '91990000046', '1992-03-24'),
('11111111147', 'Zulmira Braga Aguiar', '11990000047', '1985-07-06'),
('11111111148', 'Antônio Carlos Nóbrega', '81990000048', '1997-10-18'),
('11111111149', 'Beatriz Pinho Alencar', '23990000049', '1990-01-31'),
('11111111150', 'Caio Fontes Silveira', '99990000050', '1994-05-12');

INSERT INTO Funcionario (id_func, id_func_gerente, nome, cpf, sal_base, sal_comissao, turno) VALUES
(1, NULL, 'Gerente Supervisor Geraldo', '22222222201', 15000.00, 0, 'MANHA,TARDE,NOITE'),
(2, NULL, 'Gerente Manhã Marcos', '22222222202', 8000.00, 0, 'MANHA'),
(3, NULL, 'Gerente Tarde Tânia', '22222222203', 8000.00, 0, 'TARDE'),
(4, NULL, 'Gerente Noite Nuno', '22222222204', 9000.00, 0, 'NOITE'),
(5, NULL, 'Gerente Diurno Dário', '22222222205', 7500.00, 0, 'MANHA,TARDE'),
(6, NULL, 'Garçom Alan', '22222222206', 2500.00, 0, 'MANHA'),
(7, NULL, 'Garçom Bianca', '22222222207', 2500.00, 0, 'MANHA,TARDE'),
(8, NULL, 'Garçom Carlos', '22222222208', 2500.00, 0, 'TARDE'),
(9, NULL, 'Garçom Daniela', '22222222209', 2500.00, 0, 'NOITE'),
(10, NULL, 'Garçom Eduardo', '22222222210', 2500.00, 0, 'MANHA,TARDE'),
(11, NULL, 'Garçom Flávia', '22222222211', 2500.00, 0, 'TARDE,NOITE'),
(12, NULL, 'Garçom Gustavo', '22222222212', 2500.00, 0, 'MANHA'),
(13, NULL, 'Garçom Helena', '22222222213', 2500.00, 0, 'TARDE'),
(14, NULL, 'Garçom Igor', '22222222214', 2500.00, 0, 'NOITE'),
(15, NULL, 'Garçom Juliana', '22222222215', 2500.00, 0, 'MANHA,TARDE'),
(16, NULL, 'Garçom Kleber', '22222222216', 2500.00, 0, 'TARDE,NOITE'),
(17, NULL, 'Garçom Luan', '22222222217', 2500.00, 0, 'MANHA'),
(18, NULL, 'Garçom Mônica', '22222222218', 2500.00, 0, 'TARDE'),
(19, NULL, 'Garçom Nilton', '22222222219', 2500.00, 0, 'NOITE'),
(20, NULL, 'Garçom Olivia', '22222222220', 2500.00, 0, 'MANHA,TARDE'),
(21, NULL, 'Garçom Pedro', '22222222221', 2500.00, 0, 'TARDE,NOITE'),
(22, NULL, 'Garçom Rafaela', '22222222222', 2500.00, 0, 'MANHA'),
(23, NULL, 'Garçom Silvio', '22222222223', 2500.00, 0, 'TARDE'),
(24, NULL, 'Garçom Tainá', '22222222224', 2500.00, 0, 'NOITE'),
(25, NULL, 'Garçom Tiago', '22222222225', 2500.00, 0, 'MANHA,TARDE'),
(26, NULL, 'Garçom Ubiratan', '22222222226', 2500.00, 0, 'TARDE,NOITE'),
(27, NULL, 'Garçom Valentina', '22222222227', 2500.00, 0, 'MANHA'),
(28, NULL, 'Garçom Wagner', '22222222228', 2500.00, 0, 'TARDE'),
(29, NULL, 'Garçom Xavier', '22222222229', 2500.00, 0, 'NOITE'),
(30, NULL, 'Garçom Yasmin', '22222222230', 2500.00, 0, 'MANHA,TARDE'),
(31, NULL, 'Garçom Zilda', '22222222231', 2500.00, 0, 'TARDE,NOITE'),
(32, NULL, 'Garçom Abel', '22222222232', 2500.00, 0, 'MANHA'),
(33, NULL, 'Garçom Benjamin', '22222222233', 2500.00, 0, 'TARDE'),
(34, NULL, 'Garçom Cíntia', '22222222234', 2500.00, 0, 'NOITE'),
(35, NULL, 'Garçom Denis', '22222222235', 2500.00, 0, 'MANHA,TARDE'),
(36, NULL, 'Cozinheiro Arthur', '22222222236', 3500.00, 0, 'NOITE'),
(37, NULL, 'Cozinheiro Beto', '22222222237', 3500.00, 0, 'NOITE'),
(38, NULL, 'Cozinheiro Célia', '22222222238', 3500.00, 0, 'NOITE'),
(39, NULL, 'Cozinheiro Duda', '22222222239', 3500.00, 0, 'NOITE'),
(40, NULL, 'Cozinheiro Elen', '22222222240', 3500.00, 0, 'NOITE'),
(41, NULL, 'Barista Felipe', '22222222241', 3000.00, 0, 'MANHA'),
(42, NULL, 'Barista Gilda', '22222222242', 3000.00, 0, 'TARDE'),
(43, NULL, 'Barista Hugo', '22222222243', 3000.00, 0, 'MANHA,TARDE'),
(44, NULL, 'Barista Inês', '22222222244', 3000.00, 0, 'MANHA'),
(45, NULL, 'Barista Jonas', '22222222245', 3000.00, 0, 'TARDE'),
(46, NULL, 'Hostess Laura', '22222222246', 2800.00, 0, 'MANHA'),
(47, NULL, 'Hostess Mário', '22222222247', 2800.00, 0, 'TARDE'),
(48, NULL, 'Hostess Nádia', '22222222248', 2800.00, 0, 'NOITE'),
(49, NULL, 'Hostess Otília', '22222222249', 2800.00, 0, 'MANHA,TARDE'),
(50, NULL, 'Hostess Paulo', '22222222250', 2800.00, 0, 'TARDE,NOITE');

INSERT INTO Gerente (id_func, qnt_subordinados_max) VALUES
(1, 10),
(2, 15),
(3, 15),
(4, 5),
(5, 5);

UPDATE Funcionario SET id_func_gerente = 1 WHERE id_func IN (2, 3, 4, 5);
UPDATE Funcionario SET id_func_gerente = 4 WHERE id_func BETWEEN 36 AND 40;
UPDATE Funcionario SET id_func_gerente = 5 WHERE id_func BETWEEN 41 AND 45;
UPDATE Funcionario SET id_func_gerente = 2 WHERE id_func IN (6, 12, 17, 22, 27, 32, 46);
UPDATE Funcionario SET id_func_gerente = 3 WHERE id_func IN (8, 13, 18, 23, 28, 33, 47);
UPDATE Funcionario SET id_func_gerente = 4 WHERE id_func IN (9, 14, 19, 24, 29, 34, 48);
UPDATE Funcionario SET id_func_gerente = 5 WHERE id_func IN (7, 10, 15, 20, 25, 30, 35, 49);
UPDATE Funcionario SET id_func_gerente = 1 WHERE id_func IN (11, 16, 21, 26, 31, 50);

INSERT INTO Garcom (id_func, qnt_mesas_max) VALUES
(6, 5), (7, 5), (8, 5), (9, 5), (10, 5), (11, 5), (12, 5), (13, 5), (14, 5), (15, 5),
(16, 5), (17, 5), (18, 5), (19, 5), (20, 5), (21, 5), (22, 5), (23, 5), (24, 5), (25, 5),
(26, 5), (27, 5), (28, 5), (29, 5), (30, 5), (31, 5), (32, 5), (33, 5), (34, 5), (35, 5);

INSERT INTO Supervisiona (id_func_supervisor, id_func_supervisionado) VALUES
(1, 2),
(1, 3),
(1, 4),
(1, 5);

INSERT INTO Alergenico (alergenico) VALUES
('Glúten'),
('Lactose'),
('Frutos do Mar'),
('Amendoim'),
('Ovos'),
('Soja');

INSERT INTO Item (id_item, nome, descricao, preco_uni, disponibilidade) VALUES
(1, 'Filé Mignon ao Molho Madeira', 'Medalhão de filé mignon grelhado, servido com molho madeira e arroz à piamontese.', 110.00, 1),
(2, 'Salmão Grelhado com Legumes', 'Posta de salmão grelhado na manteiga de ervas, acompanhado de legumes no vapor.', 95.00, 1),
(3, 'Risoto de Camarão', 'Arroz arbóreo cremoso com camarões frescos, tomate cereja e manjericão.', 88.00, 1),
(4, 'Lasanha Bolonhesa Clássica', 'Massa fresca intercalada com molho bolonhesa rico e molho bechamel, gratinada com parmesão.', 70.00, 1),
(5, 'Parmegiana de Frango', 'Peito de frango empanado, coberto com molho de tomate e queijo mussarela, servido com fritas.', 65.00, 1),
(6, 'Penne ao Pesto Genovês', 'Massa tipo penne com molho pesto tradicional (manjericão, pinoli, alho, parmesão e azeite).', 62.00, 1),
(7, 'Hambúrguer Gourmet da Casa', 'Pão brioche, blend de 180g, queijo cheddar, bacon, alface, tomate e molho especial.', 55.00, 1),
(8, 'Salada Caesar com Frango', 'Alface americana, tiras de frango grelhado, croutons, lascas de parmesão e molho caesar.', 48.00, 1),
(9, 'Sopa de Cebola Gratinada', 'Tradicional sopa de cebola francesa, coberta com fatia de pão e queijo gruyère gratinado.', 45.00, 1),
(10, 'Bruschetta de Tomate e Manjericão', 'Fatias de pão italiano tostadas com tomate concassé, alho, manjericão e azeite.', 35.00, 1),
(11, 'Dadinhos de Tapioca', 'Cubos de tapioca com queijo coalho, fritos e servidos com geleia de pimenta.', 40.00, 1),
(12, 'Pastel de Carne Seca com Catupiry', 'Porção com 6 pastéis.', 42.00, 1),
(13, 'Isca de Peixe', 'Tiras de peixe empanadas e fritas, servidas com molho tártaro.', 58.00, 1),
(14, 'Tábua de Frios Mista', 'Seleção de queijos, salame, presunto parma, azeitonas e pães.', 120.00, 1),
(15, 'Polenta Frita com Queijo', 'Palitos de polenta frita cobertos com parmesão.', 38.00, 1),
(16, 'Petit Gâteau de Chocolate', 'Bolo quente de chocolate com interior cremoso, servido com sorvete de creme.', 32.00, 1),
(17, 'Cheesecake de Frutas Vermelhas', 'Torta de queijo cremosa com calda de frutas vermelhas.', 30.00, 1),
(18, 'Pudim de Leite Condensado', 'Pudim de leite tradicional com calda de caramelo.', 25.00, 1),
(19, 'Torta Alemã', 'Base de biscoito, creme holandês e cobertura de chocolate.', 28.00, 1),
(20, 'Tiramisù', 'Sobremesa italiana com biscoito champagne, café, mascarpone e cacau.', 34.00, 1),
(21, 'Salada de Frutas da Estação', 'Mix de frutas frescas da estação.', 22.00, 1),
(22, 'Moqueca Baiana', 'Peixe e camarão cozidos no leite de coco, azeite de dendê e pimentões. Acompanha arroz e farofa.', 150.00, 1),
(23, 'Feijoada Completa (Apenas Sábados)', 'Feijoada tradicional com acompanhamentos (arroz, couve, farofa, torresmo, laranja).', 130.00, 1),
(24, 'Camarão Internacional', 'Camarão salteado no arroz cremoso com presunto, ervilha e batata palha.', 140.00, 1),
(25, 'Água Mineral (com ou sem gás)', 'Garrafa 300ml.', 6.00, 1),
(26, 'Refrigerante (Lata)', 'Coca-Cola, Guaraná, etc.', 8.00, 1),
(27, 'Suco Natural de Laranja', 'Copo 400ml.', 12.00, 1),
(28, 'Suco Natural de Abacaxi com Hortelã', 'Copo 400ml.', 13.00, 1),
(29, 'Caipirinha de Cachaça', 'Cachaça, limão, açúcar e gelo.', 18.00, 1),
(30, 'Cerveja Long Neck (Heineken)', 'Garrafa 330ml.', 15.00, 1),
(31, 'Cerveja Long Neck (Budweiser)', 'Garrafa 330ml.', 14.00, 1),
(32, 'Taça de Vinho Tinto (Casa)', 'Vinho tinto seco.', 25.00, 1),
(33, 'Taça de Vinho Branco (Casa)', 'Vinho branco seco.', 25.00, 1),
(34, 'Café Espresso', 'Café espresso curto.', 7.00, 1);

INSERT INTO Prato (id_item, peso, qnt_porcoes) VALUES
(1, 500, 1),
(2, 450, 1),
(3, 400, 1),
(4, 550, 1),
(5, 500, 1),
(6, 380, 1),
(7, 450, 1),
(8, 350, 1),
(9, 300, 1),
(10, 200, 1),
(11, 300, 1),
(12, 350, 1),
(13, 400, 1),
(14, 600, 2),
(15, 300, 1),
(16, 180, 1),
(17, 150, 1),
(18, 150, 1),
(19, 160, 1),
(20, 170, 1),
(21, 250, 1),
(22, 900, 2),
(23, 1100, 2),
(24, 800, 2);

INSERT INTO Bebida (id_item, volume, teor_alcoolico, marca) VALUES
(25, 300, 0, 'Diversas'),
(26, 350, 0, 'Diversas'),
(27, 400, 0, NULL),
(28, 400, 0, NULL),
(29, 300, 15, NULL),
(30, 330, 5, 'Heineken'),
(31, 330, 5, 'Budweiser'),
(32, 150, 12, 'Vinho da Casa'),
(33, 150, 11, 'Vinho da Casa'),
(34, 50, 0, 'Café da Casa');

INSERT INTO Item_Alergenico (id_item, alergenico) VALUES
(3, 'Frutos do Mar'),
(3, 'Lactose'),
(4, 'Glúten'),
(4, 'Lactose'),
(4, 'Ovos'),
(5, 'Glúten'),
(5, 'Lactose'),
(5, 'Ovos'),
(6, 'Lactose'),
(7, 'Glúten'),
(7, 'Lactose'),
(8, 'Lactose'),
(8, 'Ovos'),
(9, 'Glúten'),
(9, 'Lactose'),
(10, 'Glúten'),
(11, 'Lactose'),
(12, 'Glúten'),
(12, 'Lactose'),
(13, 'Glúten'),
(13, 'Ovos'),
(16, 'Glúten'),
(16, 'Lactose'),
(16, 'Ovos'),
(17, 'Glúten'),
(17, 'Lactose'),
(19, 'Glúten'),
(19, 'Lactose'),
(20, 'Glúten'),
(20, 'Lactose'),
(20, 'Ovos'),
(22, 'Frutos do Mar'),
(24, 'Frutos do Mar'),
(24, 'Lactose');

INSERT INTO Reserva (id_reserva, cliente_cpf, qnt_pessoas, data_hora_chegada, status_reserva) VALUES
(1, '11111111101', 2, (@now - INTERVAL 50 MINUTE), 'EM_ATENDIMENTO'),
(2, '11111111102', 4, (@now - INTERVAL 49 MINUTE), 'EM_ATENDIMENTO'),
(3, '11111111103', 3, (@now - INTERVAL 48 MINUTE), 'EM_ATENDIMENTO'),
(4, '11111111104', 2, (@now - INTERVAL 47 MINUTE), 'EM_ATENDIMENTO'),
(5, '11111111105', 5, (@now - INTERVAL 46 MINUTE), 'EM_ATENDIMENTO'),
(6, '11111111106', 2, (@now - INTERVAL 45 MINUTE), 'EM_ATENDIMENTO'),
(7, '11111111107', 2, (@now - INTERVAL 44 MINUTE), 'EM_ATENDIMENTO'),
(8, '11111111108', 3, (@now - INTERVAL 43 MINUTE), 'EM_ATENDIMENTO'),
(9, '11111111109', 4, (@now - INTERVAL 42 MINUTE), 'EM_ATENDIMENTO'),
(10, '11111111110', 2, (@now - INTERVAL 41 MINUTE), 'EM_ATENDIMENTO'),
(11, '11111111111', 2, (@now - INTERVAL 40 MINUTE), 'EM_ATENDIMENTO'),
(12, '11111111112', 3, (@now - INTERVAL 39 MINUTE), 'EM_ATENDIMENTO'),
(13, '11111111113', 2, (@now - INTERVAL 38 MINUTE), 'EM_ATENDIMENTO'),
(14, '11111111114', 4, (@now - INTERVAL 37 MINUTE), 'EM_ATENDIMENTO'),
(15, '11111111115', 2, (@now - INTERVAL 36 MINUTE), 'EM_ATENDIMENTO'),
(16, '11111111116', 3, (@now - INTERVAL 35 MINUTE), 'EM_ATENDIMENTO'),
(17, '11111111117', 2, (@now - INTERVAL 34 MINUTE), 'EM_ATENDIMENTO'),
(18, '11111111118', 2, (@now - INTERVAL 33 MINUTE), 'EM_ATENDIMENTO'),
(19, '11111111119', 4, (@now - INTERVAL 32 MINUTE), 'EM_ATENDIMENTO'),
(20, '11111111120', 5, (@now - INTERVAL 31 MINUTE), 'EM_ATENDIMENTO'),
(21, '11111111121', 2, (@now - INTERVAL 30 MINUTE), 'EM_ATENDIMENTO'),
(22, '11111111122', 2, (@now - INTERVAL 29 MINUTE), 'EM_ATENDIMENTO'),
(23, '11111111123', 3, (@now - INTERVAL 28 MINUTE), 'EM_ATENDIMENTO'),
(24, '11111111124', 2, (@now - INTERVAL 27 MINUTE), 'EM_ATENDIMENTO'),
(25, '11111111125', 4, (@now - INTERVAL 26 MINUTE), 'EM_ATENDIMENTO'),
(26, '11111111126', 2, (@now - INTERVAL 25 MINUTE), 'EM_ATENDIMENTO'),
(27, '11111111127', 3, (@now - INTERVAL 24 MINUTE), 'EM_ATENDIMENTO'),
(28, '11111111128', 2, (@now - INTERVAL 23 MINUTE), 'EM_ATENDIMENTO'),
(29, '11111111129', 2, (@now - INTERVAL 22 MINUTE), 'EM_ATENDIMENTO'),
(30, '11111111130', 4, (@now - INTERVAL 21 MINUTE), 'EM_ATENDIMENTO'),
(31, '11111111131', 5, (@now - INTERVAL 20 MINUTE), 'EM_ATENDIMENTO'),
(32, '11111111132', 2, (@now - INTERVAL 19 MINUTE), 'EM_ATENDIMENTO'),
(33, '11111111133', 2, (@now - INTERVAL 18 MINUTE), 'EM_ATENDIMENTO'),
(34, '11111111134', 3, (@now - INTERVAL 17 MINUTE), 'EM_ATENDIMENTO'),
(35, '11111111135', 2, (@now - INTERVAL 16 MINUTE), 'EM_ATENDIMENTO'),
(36, '11111111136', 4, (@now - INTERVAL 15 MINUTE), 'EM_ATENDIMENTO'),
(37, '11111111137', 2, (@now - INTERVAL 14 MINUTE), 'EM_ATENDIMENTO'),
(38, '11111111138', 3, (@now - INTERVAL 13 MINUTE), 'EM_ATENDIMENTO'),
(39, '11111111139', 2, (@now - INTERVAL 12 MINUTE), 'EM_ATENDIMENTO'),
(40, '11111111140', 2, (@now - INTERVAL 11 MINUTE), 'EM_ATENDIMENTO'),
(41, '11111111141', 4, (@now - INTERVAL 10 MINUTE), 'EM_ATENDIMENTO'),
(42, '11111111142', 5, (@now - INTERVAL 9 MINUTE), 'EM_ATENDIMENTO'),
(43, '11111111143', 2, (@now - INTERVAL 8 MINUTE), 'EM_ATENDIMENTO'),
(44, '11111111144', 2, (@now - INTERVAL 7 MINUTE), 'EM_ATENDIMENTO'),
(45, '11111111145', 3, (@now - INTERVAL 6 MINUTE), 'EM_ATENDIMENTO'),
(46, '11111111146', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(47, '11111111147', 4, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(48, '11111111148', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(49, '11111111149', 3, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(50, '11111111150', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(51, '11111111101', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(52, '11111111102', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(53, '11111111103', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(54, '11111111104', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(55, '11111111105', 2, (@now - INTERVAL 5 MINUTE), 'EM_ATENDIMENTO'),
(56, '11111111101', 2, (@now - INTERVAL 30 DAY), 'FECHADA'),
(57, '11111111102', 4, (@now - INTERVAL 29 DAY), 'FECHADA'),
(58, '11111111103', 3, (@now - INTERVAL 28 DAY), 'FECHADA'),
(59, '11111111104', 2, (@now - INTERVAL 27 DAY), 'FECHADA'),
(60, '11111111105', 5, (@now - INTERVAL 26 DAY), 'FECHADA'),
(61, '11111111106', 2, (@now - INTERVAL 25 DAY), 'FECHADA'),
(62, '11111111107', 2, (@now - INTERVAL 24 DAY), 'FECHADA'),
(63, '11111111108', 3, (@now - INTERVAL 23 DAY), 'FECHADA'),
(64, '11111111109', 4, (@now - INTERVAL 22 DAY), 'FECHADA'),
(65, '11111111110', 2, (@now - INTERVAL 21 DAY), 'FECHADA'),
(66, '11111111111', 2, (@now - INTERVAL 20 DAY), 'FECHADA'),
(67, '11111111112', 3, (@now - INTERVAL 19 DAY), 'FECHADA'),
(68, '11111111113', 2, (@now - INTERVAL 18 DAY), 'FECHADA'),
(69, '11111111114', 4, (@now - INTERVAL 17 DAY), 'FECHADA'),
(70, '11111111115', 2, (@now - INTERVAL 16 DAY), 'FECHADA'),
(71, '11111111116', 3, (@now - INTERVAL 15 DAY), 'FECHADA'),
(72, '11111111117', 2, (@now - INTERVAL 14 DAY), 'FECHADA'),
(73, '11111111118', 2, (@now - INTERVAL 13 DAY), 'FECHADA'),
(74, '11111111119', 4, (@now - INTERVAL 12 DAY), 'FECHADA'),
(75, '11111111120', 5, (@now - INTERVAL 11 DAY), 'FECHADA'),
(76, '11111111121', 2, (@now - INTERVAL 10 DAY), 'FECHADA'),
(77, '11111111122', 2, (@now - INTERVAL 9 DAY), 'FECHADA'),
(78, '11111111123', 3, (@now - INTERVAL 8 DAY), 'FECHADA'),
(79, '11111111124', 2, (@now - INTERVAL 7 DAY), 'FECHADA'),
(80, '11111111125', 4, (@now - INTERVAL 6 DAY), 'FECHADA'),
(81, '11111111126', 2, (@now - INTERVAL 5 DAY), 'FECHADA'),
(82, '11111111127', 3, (@now - INTERVAL 4 DAY), 'FECHADA'),
(83, '11111111128', 2, (@now - INTERVAL 3 DAY), 'FECHADA'),
(84, '11111111129', 2, (@now - INTERVAL 2 DAY), 'FECHADA'),
(85, '11111111130', 4, (@now - INTERVAL 1 DAY), 'FECHADA'),
(86, '11111111131', 5, (@now - INTERVAL 1 DAY), 'FECHADA'),
(87, '11111111132', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(88, '11111111133', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(89, '11111111134', 3, (@now - INTERVAL 1 DAY), 'FECHADA'),
(90, '11111111135', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(91, '11111111136', 4, (@now - INTERVAL 1 DAY), 'FECHADA'),
(92, '11111111137', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(93, '11111111138', 3, (@now - INTERVAL 1 DAY), 'FECHADA'),
(94, '11111111139', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(95, '11111111140', 2, (@now - INTERVAL 1 DAY), 'FECHADA'),
(96, '11111111141', 2, (@now + INTERVAL 10 MINUTE), 'ABERTA'),
(97, '11111111142', 4, (@now + INTERVAL 15 MINUTE), 'ABERTA'),
(98, '11111111143', 3, (@now + INTERVAL 20 MINUTE), 'ABERTA'),
(99, '11111111144', 2, (@now + INTERVAL 25 MINUTE), 'ABERTA'),
(100, '11111111145', 5, (@now + INTERVAL 30 MINUTE), 'ABERTA'),
(101, '11111111146', 2, (@now + INTERVAL 35 MINUTE), 'ABERTA'),
(102, '11111111147', 2, (@now + INTERVAL 40 MINUTE), 'ABERTA'),
(103, '11111111148', 3, (@now + INTERVAL 45 MINUTE), 'ABERTA'),
(104, '11111111149', 4, (@now + INTERVAL 50 MINUTE), 'ABERTA'),
(105, '11111111150', 2, (@now + INTERVAL 55 MINUTE), 'ABERTA'),
(106, '11111111101', 2, (@now + INTERVAL 59 MINUTE), 'ABERTA'),
(107, '11111111102', 3, (@now + INTERVAL 59 MINUTE), 'ABERTA'),
(108, '11111111103', 2, (@now + INTERVAL 59 MINUTE), 'ABERTA'),
(109, '11111111104', 4, (@now + INTERVAL 59 MINUTE), 'ABERTA'),
(110, '11111111105', 2, (@now + INTERVAL 59 MINUTE), 'ABERTA'),
(111, '11111111106', 3, (@now + INTERVAL 1 HOUR), 'ABERTA'),
(112, '11111111107', 2, (@now + INTERVAL 2 HOUR), 'ABERTA'),
(113, '11111111108', 2, (@now + INTERVAL 3 HOUR), 'ABERTA'),
(114, '11111111109', 4, (@now + INTERVAL 4 HOUR), 'ABERTA'),
(115, '11111111110', 5, (@now + INTERVAL 5 HOUR), 'ABERTA'),
(116, '11111111111', 2, (@now + INTERVAL 6 HOUR), 'ABERTA'),
(117, '11111111112', 2, (@now + INTERVAL 1 DAY), 'ABERTA'),
(118, '11111111113', 3, (@now + INTERVAL 1 DAY), 'ABERTA'),
(119, '11111111114', 2, (@now + INTERVAL 1 DAY), 'ABERTA'),
(120, '11111111115', 4, (@now + INTERVAL 1 DAY), 'ABERTA'),
(121, '11111111116', 2, (@now + INTERVAL 2 DAY), 'ABERTA'),
(122, '11111111117', 3, (@now + INTERVAL 2 DAY), 'ABERTA'),
(123, '11111111118', 2, (@now + INTERVAL 2 DAY), 'ABERTA'),
(124, '11111111119', 2, (@now + INTERVAL 2 DAY), 'ABERTA'),
(125, '11111111120', 4, (@now + INTERVAL 2 DAY), 'ABERTA'),
(126, '11111111121', 5, (@now + INTERVAL 3 DAY), 'ABERTA'),
(127, '11111111122', 2, (@now + INTERVAL 3 DAY), 'ABERTA'),
(128, '11111111123', 2, (@now + INTERVAL 3 DAY), 'ABERTA'),
(129, '11111111124', 3, (@now + INTERVAL 3 DAY), 'ABERTA'),
(130, '11111111125', 2, (@now + INTERVAL 4 DAY), 'ABERTA'),
(131, '11111111126', 4, (@now + INTERVAL 4 DAY), 'ABERTA'),
(132, '11111111127', 2, (@now + INTERVAL 4 DAY), 'ABERTA'),
(133, '11111111128', 3, (@now + INTERVAL 5 DAY), 'ABERTA'),
(134, '11111111129', 2, (@now + INTERVAL 5 DAY), 'ABERTA'),
(135, '11111111130', 2, (@now + INTERVAL 5 DAY), 'ABERTA'),
(136, '11111111131', 4, (@now + INTERVAL 6 DAY), 'ABERTA'),
(137, '11111111132', 5, (@now + INTERVAL 6 DAY), 'ABERTA'),
(138, '11111111133', 2, (@now + INTERVAL 7 DAY), 'ABERTA'),
(139, '11111111134', 2, (@now + INTERVAL 7 DAY), 'ABERTA'),
(140, '11111111135', 3, (@now + INTERVAL 8 DAY), 'ABERTA'),
(141, '11111111136', 2, (@now + INTERVAL 9 DAY), 'ABERTA'),
(142, '11111111137', 4, (@now + INTERVAL 10 DAY), 'ABERTA'),
(143, '11111111138', 2, (@now + INTERVAL 11 DAY), 'ABERTA'),
(144, '11111111139', 3, (@now + INTERVAL 12 DAY), 'ABERTA'),
(145, '11111111140', 2, (@now + INTERVAL 13 DAY), 'ABERTA'),
(146, '11111111141', 2, (@now + INTERVAL 14 DAY), 'ABERTA'),
(147, '11111111142', 4, (@now + INTERVAL 15 DAY), 'ABERTA'),
(148, '11111111143', 5, (@now + INTERVAL 16 DAY), 'ABERTA'),
(149, '11111111144', 2, (@now + INTERVAL 17 DAY), 'ABERTA'),
(150, '11111111145', 2, (@now + INTERVAL 18 DAY), 'ABERTA'),
(151, '11111111146', 3, (@now + INTERVAL 19 DAY), 'ABERTA'),
(152, '11111111147', 2, (@now + INTERVAL 20 DAY), 'ABERTA'),
(153, '11111111148', 4, (@now + INTERVAL 25 DAY), 'ABERTA'),
(154, '11111111149', 2, (@now + INTERVAL 28 DAY), 'ABERTA'),
(155, '11111111150', 3, (@now + INTERVAL 30 DAY), 'ABERTA');

INSERT INTO Mesa (id_mesa, id_func, id_reserva, status_mesa, capacidade) VALUES
(1, 6, 1, 'OCUPADA', 2),
(2, 6, 2, 'OCUPADA', 4),
(3, 6, 3, 'OCUPADA', 4),
(4, 6, 4, 'OCUPADA', 2),
(5, 6, 5, 'OCUPADA', 6),
(6, 7, 6, 'OCUPADA', 2),
(7, 7, 7, 'OCUPADA', 2),
(8, 7, 8, 'OCUPADA', 4),
(9, 7, 9, 'OCUPADA', 4),
(10, 7, 10, 'OCUPADA', 2),
(11, 8, 11, 'OCUPADA', 2),
(12, 8, 12, 'OCUPADA', 4),
(13, 8, 13, 'OCUPADA', 2),
(14, 8, 14, 'OCUPADA', 4),
(15, 8, 15, 'OCUPADA', 2),
(16, 9, 16, 'OCUPADA', 4),
(17, 9, 17, 'OCUPADA', 2),
(18, 9, 18, 'OCUPADA', 2),
(19, 9, 19, 'OCUPADA', 4),
(20, 9, 20, 'OCUPADA', 6),
(21, 10, 21, 'OCUPADA', 2),
(22, 10, 22, 'OCUPADA', 2),
(23, 10, 23, 'OCUPADA', 4),
(24, 10, 24, 'OCUPADA', 2),
(25, 10, 25, 'OCUPADA', 4),
(26, 11, 26, 'OCUPADA', 2),
(27, 11, 27, 'OCUPADA', 4),
(28, 11, 28, 'OCUPADA', 2),
(29, 11, 29, 'OCUPADA', 2),
(30, 11, 30, 'OCUPADA', 4),
(31, 12, 31, 'OCUPADA', 6),
(32, 12, 32, 'OCUPADA', 2),
(33, 12, 33, 'OCUPADA', 2),
(34, 12, 34, 'OCUPADA', 4),
(35, 12, 35, 'OCUPADA', 2),
(36, 13, 36, 'OCUPADA', 4),
(37, 13, 37, 'OCUPADA', 2),
(38, 13, 38, 'OCUPADA', 4),
(39, 13, 39, 'OCUPADA', 2),
(40, 13, 40, 'OCUPADA', 2),
(41, 14, 41, 'OCUPADA', 4),
(42, 14, 42, 'OCUPADA', 6),
(43, 14, 43, 'OCUPADA', 2),
(44, 14, 44, 'OCUPADA', 2),
(45, 14, 45, 'OCUPADA', 4),
(46, 15, 46, 'OCUPADA', 2),
(47, 15, 47, 'OCUPADA', 4),
(48, 15, 48, 'OCUPADA', 2),
(49, 15, 49, 'OCUPADA', 4),
(50, 15, 50, 'OCUPADA', 2),
(51, 16, 51, 'OCUPADA', 2),
(52, 16, 52, 'OCUPADA', 2),
(53, 16, 53, 'OCUPADA', 2),
(54, 16, 54, 'OCUPADA', 2),
(55, 16, 55, 'OCUPADA', 2),
(56, NULL, 96, 'RESERVADA', 2),
(57, NULL, 97, 'RESERVADA', 4),
(58, NULL, 98, 'RESERVADA', 4),
(59, NULL, 99, 'RESERVADA', 2),
(60, NULL, 100, 'RESERVADA', 6),
(61, NULL, 101, 'RESERVADA', 2),
(62, NULL, 102, 'RESERVADA', 2),
(63, NULL, 103, 'RESERVADA', 4),
(64, NULL, 104, 'RESERVADA', 4),
(65, NULL, 105, 'RESERVADA', 2),
(66, NULL, 106, 'RESERVADA', 2),
(67, NULL, 107, 'RESERVADA', 4),
(68, NULL, 108, 'RESERVADA', 2),
(69, NULL, 109, 'RESERVADA', 4),
(70, NULL, 110, 'RESERVADA', 2),
(71, NULL, NULL, 'LIVRE', 2),
(72, NULL, NULL, 'LIVRE', 2),
(73, NULL, NULL, 'LIVRE', 4),
(74, NULL, NULL, 'LIVRE', 4),
(75, NULL, NULL, 'LIVRE', 6),
(76, NULL, NULL, 'LIVRE', 2),
(77, NULL, NULL, 'LIVRE', 2),
(78, NULL, NULL, 'LIVRE', 4),
(79, NULL, NULL, 'LIVRE', 4),
(80, NULL, NULL, 'LIVRE', 2),
(81, NULL, NULL, 'LIVRE', 6),
(82, NULL, NULL, 'LIVRE', 2),
(83, NULL, NULL, 'LIVRE', 2),
(84, NULL, NULL, 'LIVRE', 4),
(85, NULL, NULL, 'LIVRE', 4),
(86, NULL, NULL, 'LIVRE', 2),
(87, NULL, NULL, 'LIVRE', 2),
(88, NULL, NULL, 'LIVRE', 4),
(89, NULL, NULL, 'LIVRE', 2),
(90, NULL, NULL, 'LIVRE', 6),
(91, NULL, NULL, 'LIVRE', 2),
(92, NULL, NULL, 'LIVRE', 2),
(93, NULL, NULL, 'LIVRE', 4),
(94, NULL, NULL, 'LIVRE', 4),
(95, NULL, NULL, 'LIVRE', 2),
(96, NULL, NULL, 'LIVRE', 6),
(97, NULL, NULL, 'LIVRE', 2),
(98, NULL, NULL, 'LIVRE', 2),
(99, NULL, NULL, 'LIVRE', 4),
(100, NULL, NULL, 'LIVRE', 2);

INSERT INTO Comanda (id_comanda, id_mesa, total, data_hora_criacao, status_comanda) VALUES
(1, 1, 0, (@now - INTERVAL 50 MINUTE), 'ABERTA'),
(2, 2, 0, (@now - INTERVAL 49 MINUTE), 'ABERTA'),
(3, 3, 0, (@now - INTERVAL 48 MINUTE), 'ABERTA'),
(4, 4, 0, (@now - INTERVAL 47 MINUTE), 'ABERTA'),
(5, 5, 0, (@now - INTERVAL 46 MINUTE), 'ABERTA'),
(6, 6, 0, (@now - INTERVAL 45 MINUTE), 'ABERTA'),
(7, 7, 0, (@now - INTERVAL 44 MINUTE), 'ABERTA'),
(8, 8, 0, (@now - INTERVAL 43 MINUTE), 'ABERTA'),
(9, 9, 0, (@now - INTERVAL 42 MINUTE), 'ABERTA'),
(10, 10, 0, (@now - INTERVAL 41 MINUTE), 'ABERTA'),
(11, 11, 0, (@now - INTERVAL 40 MINUTE), 'ABERTA'),
(12, 12, 0, (@now - INTERVAL 39 MINUTE), 'ABERTA'),
(13, 13, 0, (@now - INTERVAL 38 MINUTE), 'ABERTA'),
(14, 14, 0, (@now - INTERVAL 37 MINUTE), 'ABERTA'),
(15, 15, 0, (@now - INTERVAL 36 MINUTE), 'ABERTA'),
(16, 16, 0, (@now - INTERVAL 35 MINUTE), 'ABERTA'),
(17, 17, 0, (@now - INTERVAL 34 MINUTE), 'ABERTA'),
(18, 18, 0, (@now - INTERVAL 33 MINUTE), 'ABERTA'),
(19, 19, 0, (@now - INTERVAL 32 MINUTE), 'ABERTA'),
(20, 20, 0, (@now - INTERVAL 31 MINUTE), 'FECHADA'),
(21, 21, 0, (@now - INTERVAL 30 MINUTE), 'FECHADA'),
(22, 22, 0, (@now - INTERVAL 29 MINUTE), 'FECHADA'),
(23, 23, 0, (@now - INTERVAL 28 MINUTE), 'FECHADA'),
(24, 24, 0, (@now - INTERVAL 27 MINUTE), 'FECHADA'),
(25, 25, 0, (@now - INTERVAL 26 MINUTE), 'FECHADA'),
(26, 26, 0, (@now - INTERVAL 25 MINUTE), 'FECHADA'),
(27, 27, 0, (@now - INTERVAL 24 MINUTE), 'FECHADA'),
(28, 28, 0, (@now - INTERVAL 23 MINUTE), 'FECHADA'),
(29, 29, 0, (@now - INTERVAL 22 MINUTE), 'FECHADA'),
(30, 30, 0, (@now - INTERVAL 21 MINUTE), 'FECHADA'),
(31, 31, 0, (@now - INTERVAL 20 MINUTE), 'FECHADA'),
(32, 32, 0, (@now - INTERVAL 19 MINUTE), 'FECHADA'),
(33, 33, 0, (@now - INTERVAL 18 MINUTE), 'FECHADA'),
(34, 34, 0, (@now - INTERVAL 17 MINUTE), 'FECHADA'),
(35, 35, 0, (@now - INTERVAL 16 MINUTE), 'FECHADA'),
(36, 36, 0, (@now - INTERVAL 15 MINUTE), 'FECHADA'),
(37, 37, 0, (@now - INTERVAL 14 MINUTE), 'FECHADA'),
(38, 38, 0, (@now - INTERVAL 13 MINUTE), 'FECHADA'),
(39, 39, 0, (@now - INTERVAL 12 MINUTE), 'FECHADA'),
(40, 40, 0, (@now - INTERVAL 11 MINUTE), 'FECHADA'),
(41, 41, 0, (@now - INTERVAL 10 MINUTE), 'ABERTA'),
(42, 42, 0, (@now - INTERVAL 9 MINUTE), 'ABERTA'),
(43, 43, 0, (@now - INTERVAL 8 MINUTE), 'ABERTA'),
(44, 44, 0, (@now - INTERVAL 7 MINUTE), 'ABERTA'),
(45, 45, 0, (@now - INTERVAL 6 MINUTE), 'ABERTA'),
(46, 46, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(47, 47, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(48, 48, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(49, 49, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(50, 50, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(51, 51, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(52, 52, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(53, 53, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(54, 54, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(55, 55, 0, (@now - INTERVAL 5 MINUTE), 'ABERTA'),
(56, 1, 0, (@now - INTERVAL 30 DAY), 'FECHADA'),
(57, 2, 0, (@now - INTERVAL 29 DAY), 'FECHADA'),
(58, 3, 0, (@now - INTERVAL 28 DAY), 'FECHADA'),
(59, 4, 0, (@now - INTERVAL 27 DAY), 'FECHADA'),
(60, 5, 0, (@now - INTERVAL 26 DAY), 'FECHADA'),
(61, 6, 0, (@now - INTERVAL 25 DAY), 'FECHADA'),
(62, 7, 0, (@now - INTERVAL 24 DAY), 'FECHADA'),
(63, 8, 0, (@now - INTERVAL 23 DAY), 'FECHADA'),
(64, 9, 0, (@now - INTERVAL 22 DAY), 'FECHADA'),
(65, 10, 0, (@now - INTERVAL 21 DAY), 'FECHADA'),
(66, 11, 0, (@now - INTERVAL 20 DAY), 'FECHADA'),
(67, 12, 0, (@now - INTERVAL 19 DAY), 'FECHADA'),
(68, 13, 0, (@now - INTERVAL 18 DAY), 'FECHADA'),
(69, 14, 0, (@now - INTERVAL 17 DAY), 'FECHADA'),
(70, 15, 0, (@now - INTERVAL 16 DAY), 'FECHADA'),
(71, 16, 0, (@now - INTERVAL 15 DAY), 'FECHADA'),
(72, 17, 0, (@now - INTERVAL 14 DAY), 'FECHADA'),
(73, 18, 0, (@now - INTERVAL 13 DAY), 'FECHADA'),
(74, 19, 0, (@now - INTERVAL 12 DAY), 'FECHADA'),
(75, 20, 0, (@now - INTERVAL 11 DAY), 'FECHADA'),
(76, 21, 0, (@now - INTERVAL 10 DAY), 'FECHADA'),
(77, 22, 0, (@now - INTERVAL 9 DAY), 'FECHADA'),
(78, 23, 0, (@now - INTERVAL 8 DAY), 'FECHADA'),
(79, 24, 0, (@now - INTERVAL 7 DAY), 'FECHADA'),
(80, 25, 0, (@now - INTERVAL 6 DAY), 'FECHADA'),
(81, 26, 0, (@now - INTERVAL 5 DAY), 'FECHADA'),
(82, 27, 0, (@now - INTERVAL 4 DAY), 'FECHADA'),
(83, 28, 0, (@now - INTERVAL 3 DAY), 'FECHADA'),
(84, 29, 0, (@now - INTERVAL 2 DAY), 'FECHADA'),
(85, 30, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(86, 31, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(87, 32, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(88, 33, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(89, 34, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(90, 35, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(91, 36, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(92, 37, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(93, 38, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(94, 39, 0, (@now - INTERVAL 1 DAY), 'FECHADA'),
(95, 40, 0, (@now - INTERVAL 1 DAY), 'FECHADA');

INSERT INTO Solicitado (id_item, id_comanda, qnt) VALUES
(1, 1, 1), (27, 1, 2),
(2, 2, 2), (29, 2, 2), (30, 2, 2),
(3, 3, 1), (26, 3, 3),
(4, 4, 1), (25, 4, 1), (34, 4, 1),
(5, 5, 2), (7, 5, 3), (26, 5, 5),
(6, 6, 1), (28, 6, 2),
(7, 7, 1), (26, 7, 1), (16, 7, 1),
(8, 8, 2), (25, 8, 2),
(9, 9, 2), (32, 9, 2), (18, 9, 2),
(10, 10, 1), (30, 10, 2),
(11, 11, 1), (29, 11, 2),
(12, 12, 1), (26, 12, 3),
(13, 13, 1), (30, 13, 1), (31, 13, 1),
(14, 14, 1), (32, 14, 2), (33, 14, 2),
(15, 15, 1), (27, 15, 1),
(16, 16, 1), (34, 16, 2),
(17, 17, 1), (25, 17, 1),
(18, 18, 1), (26, 18, 1),
(19, 19, 2), (28, 19, 2),
(20, 20, 3), (30, 20, 6),
(21, 21, 1), (25, 21, 1),
(22, 22, 1), (29, 22, 2),
(23, 23, 1), (30, 23, 2), (26, 23, 1),
(24, 24, 1), (33, 24, 2),
(1, 25, 2), (26, 25, 4),
(2, 26, 1), (27, 26, 1),
(3, 27, 1), (28, 27, 1),
(4, 28, 1), (29, 28, 1),
(5, 29, 1), (30, 29, 1),
(6, 30, 2), (31, 30, 2),
(7, 31, 3), (26, 31, 3), (34, 31, 3),
(8, 32, 1), (25, 32, 2),
(9, 33, 1), (32, 33, 1),
(10, 34, 1), (33, 34, 1),
(11, 35, 1), (27, 35, 1),
(12, 36, 2), (26, 36, 2), (18, 36, 2),
(13, 37, 1), (30, 37, 1),
(14, 38, 1), (32, 38, 2),
(15, 39, 1), (29, 39, 1),
(16, 40, 1), (34, 40, 1),
(17, 41, 2), (25, 41, 2),
(18, 42, 1), (26, 42, 1),
(19, 43, 1), (27, 43, 1),
(20, 44, 1), (28, 44, 1),
(21, 45, 2), (29, 45, 2),
(22, 46, 1), (30, 46, 3),
(23, 47, 1), (31, 47, 4),
(24, 48, 1), (32, 48, 2),
(1, 49, 1), (26, 49, 2),
(2, 50, 1), (27, 50, 1),
(3, 51, 1), (28, 51, 1),
(4, 52, 1), (25, 52, 1),
(5, 53, 1), (26, 53, 1),
(6, 54, 1), (27, 54, 1),
(7, 55, 1), (28, 55, 1),
(1, 56, 1), (25, 56, 2),
(2, 57, 2), (26, 57, 4),
(3, 58, 1), (27, 58, 1),
(4, 59, 1), (28, 59, 1),
(5, 60, 3), (29, 60, 5),
(6, 61, 1), (30, 61, 1),
(7, 62, 1), (31, 62, 1),
(8, 63, 1), (32, 63, 1),
(9, 64, 2), (33, 64, 2),
(10, 65, 1), (34, 65, 1),
(11, 66, 1), (25, 66, 1),
(12, 67, 1), (26, 67, 1),
(13, 68, 1), (27, 68, 1),
(14, 69, 1), (28, 69, 2),
(15, 70, 1), (29, 70, 1),
(16, 71, 2), (30, 71, 3),
(17, 72, 1), (31, 72, 1),
(18, 73, 1), (32, 73, 1),
(19, 74, 2), (33, 74, 2),
(20, 75, 1), (34, 75, 3),
(21, 76, 1), (25, 76, 1),
(22, 77, 1), (26, 77, 1),
(23, 78, 1), (27, 78, 1),
(24, 79, 1), (28, 79, 1),
(1, 80, 2), (29, 80, 2),
(2, 81, 1), (30, 81, 1),
(3, 82, 1), (31, 82, 1),
(4, 83, 1), (32, 83, 1),
(5, 84, 1), (33, 84, 1),
(6, 85, 2), (34, 85, 2),
(7, 86, 3), (25, 86, 3),
(8, 87, 1), (26, 87, 1),
(9, 88, 1), (27, 88, 1),
(10, 89, 1), (28, 89, 1),
(11, 90, 1), (29, 90, 1),
(12, 91, 1), (30, 91, 2),
(13, 92, 1), (31, 92, 1),
(14, 93, 1), (32, 93, 2),
(15, 94, 1), (33, 94, 1),
(16, 95, 1), (34, 95, 1);

UPDATE Comanda
SET status_comanda = 'PAGA'
WHERE id_comanda BETWEEN 56 AND 95;

UPDATE Reserva 
SET status_reserva = 'CANCELADA' 
WHERE id_reserva BETWEEN 111 AND 132;