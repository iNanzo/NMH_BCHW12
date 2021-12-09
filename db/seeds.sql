INSERT INTO department (dept_name)
VALUES
    ("Engineering"),
    ("Sales"),
    ("Finance"),
    ("Legal");

INSERT INTO roles (title, salary, department_id)
VALUES    
    ("Lead Engineer", 40000, 1),
    ("Software Engineer", 30000, 1),
    ("Salesman", 15000, 2),
    ("Accountant", 25000, 3),
    ("Lawyer", 35000, 4);

INSERT INTO employees (first_name, last_name, role_id, manager_id)
VALUES
    ("Newton", "Hoang", 1, null),
    ("Thomas", "Nguyen", 2, 1),
    ("Caris", "Matic", 3, null),
    ("Isfan", "Gunawan", 2, 1),
    ("Als", "Miles", 3, 3),
    ("Goodwin", "Umber", 4, null),
    ("Cal", "Curator", 4, 6),
    ("Pheonix", "Wright", 5, null);
