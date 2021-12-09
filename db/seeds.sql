INSERT INTO department (dept_name)
VALUES
    ("Engineering"),
    ("Construction"),
    ("Programming");

INSERT INTO roles (title, salary, department_id)
VALUES
    ("Electrical Engineer", 20000, 1),
    ("Civil Engineer", 30000, 1),
    ("Mechanical Operator", 15000, 2),
    ("Safety Officer", 20000, 2),
    ("Javascript Developer", 40000, 3),
    ("Full Stack Developer", 50000, 3);

insert into employees (first_name, last_name, role_id)
values
    ('Thedric', 'Brothwood', 1),
    ('Russell', 'McManamen', 2),
    ('Kiele', 'Smedmore', 3),
    ('Jodi', 'Cadogan', 4),
    ('Tani', 'Chislett', 5);

insert into employees (first_name, last_name, role_id, manager_id)
values
    ('Cassie', 'Lukas', 1, 1),
    ('Dulcea', 'Piscopo', 2, 2),
    ('Wallie', 'Pancast', 3, 3),
    ('Marissa', 'Peasegod', 4, 4);