/* Constants */
// Require
const mysql = require("mysql2");
const inquirer = require("inquirer");
const question = require("./src/questions")
require("dotenv").config();

// SQL Database Connection
const db = mysql.createConnection(
    {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    },
    console.log(`Successfully connected to the ${process.env.DB_NAME} database.`)
);

// Menu Prompt Functions

function mainMenuPrompt(){
    inquirer.prompt(question.mainMenu)
        .then((response) => {
                switch (response.mainMenu) {
                    case "View":
                        viewPrompt();
                        break;

                    case "Add/Update":
                        addPrompt();
                        break;
                        
                    case "Quit":
                        console.log("Closing Application...")
                        process.kill(process.pid)
                        break;
                }
            })
}

function viewPrompt(){
    inquirer.prompt(question.viewMenu)
        .then((response) => {
                switch(response.viewMenu) {
                    case "View All Employees":
                        renderDB("SELECT a.id, a.first_name,a.last_name, roles.title, department.dept_name, roles.salary, CONCAT(b.last_name,\',\',b.first_name) AS Manager FROM employees a JOIN roles ON roles.id = a.role_id JOIN department ON roles.department_id = department.id left JOIN employees b ON a.manager_id = b.id ORDER BY a.id;")
                        break;
                        
                    case "View All Roles":
                        renderDB("SELECT roles.title, roles.id,department.dept_name,roles.salary FROM roles LEFT JOIN department ON department.id = roles.department_id ORDER BY roles.id;");
                        break;

                    case "View All Departments":
                        renderDB("SELECT * FROM department ORDER BY id;");
                        break;

                    case "View Employee By Manager":
                        employeeByManager();
                        break;

                    case "View Employees By Department":
                        employeeByDept();
                        break;

                    case "<":
                        mainMenuPrompt();
                        break;
                }
            })
}

function addPrompt(){
    inquirer.prompt(question.auMenu)
        .then((response) => {
                switch (response.auMenu) {
                    case "Add Department":
                        addDepartment();
                        break;

                    case "Add Role":
                        addRole();
                        break;

                    case "Add Employee":
                        addEmployee();
                        break;

                    case "Update Employee Manager":
                        updateManager();
                        break;

                    case "<":
                        mainMenuPrompt();
                        break;
                }
            })
}

function addDepartment(){
    inquirer.prompt(question.addDepartment)
        .then((response) => {
                let departmentName = titleCase(response.name);
                manipulateDB(`INSERT INTO department (dept_name) VALUES ("${departmentName}")`);
            })
}

function addRole(){
    inquirer.prompt(question.addRole)
        .then((response) => {
                addRoleAdditional(response.name, response.salary);
            })
}

function addEmployee(){
    inquirer.prompt(question.addEmployee)
        .then((response) => {
                addEmployeeAdditional(response.firstName, response.lastName)
            })
}

async function renderDB(db) {
    await db.promise().query(db).then((results) => {
        console.table(results[0])
    })
    mainMenuPrompt();
}

async function manipulateDB(db) {
    await db.promise().query(db).then(() => {
        console.log("Query successful.")
    })
    mainMenuPrompt();
}

async function addRoleAdditional(title, salary) {
    let deptArr = [];
    let reference;
    //todo title case the title in insert
    await db.promise().query("select * from department").then((results) => {
        reference = results[0];
        results[0].forEach(element => {
            deptArr.push(element.dept_name)
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "Which department does this role belong to?",
            name: "department",
            choices: deptArr
        }]
    )
        .then(
            (response) => {
                let properTitle = titleCase(title)
                let id = getID(reference, "dept_name", response, "department");
                manipulateDB(`INSERT INTO roles (title, salary, department_id) VALUES("${properTitle}", "${salary}", "${id}")`);
            })
}

async function addEmployeeAdditional(firstName, lastName) {
    let rolesArr = [];
    let rolesRef;
    let managerArr = [];
    let managerRef;
    await db.promise().query("select id, title from roles order by id").then((results) => {
        rolesRef = results[0];
        rolesRef.forEach(element => {
            rolesArr.push(element.title)
        })
    })
    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        managerRef = results[0];
        results[0].forEach(element => {
            managerArr.push(element.fullastName)
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "What is the role of this employee?",
            name: "role",
            choices: rolesArr
        },
        {
            type: "list",
            message: "Who is the manager of this employee?",
            name: "manager",
            choices: managerArr
        }
        ]
    )
        .then((response) => {
                let storedFirstName = titleCase(firstName)
                let storedLastName = titleCase(lastName)
                let roleId = getID(rolesRef, "title", response, "role")
                let managerId = getID(managerRef, "fullastName", response, "manager")
                manipulateDB(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES("${storedFirstName}", "${storedLastName}", "${roleId}", "${managerId}")`);
            })
}

async function updateManager(){
    let empArr = [];
    let empRef;

    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        empRef = results[0];
        results[0].forEach(element => {
            empArr.push(element.fullastName)
        })
    })

    inquirer.prompt(
        [{
            type: "list",
            message: "Select an employee: ",
            name: "employee",
            choices: empArr
        },
        {
            type: "list",
            message: "Select a new manager: ",
            name: "manager",
            choices: empArr
        }]
    ).then((response) => {
            let empID = getID(empRef, "fullastName", response, "employee")
            let manID = getID(empRef, "fullastName", response, "manager")
            manipulateDB(`UPDATE employees set manager_id = ${manID} where id = ${empID}`)
        })
}

async function employeeByManager(){
    let empArr = [];
    let empRef;

    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        empRef = results[0];
        results[0].forEach(element => {
            empArr.push(element.fullastName)
        })
    })

    inquirer.prompt(
        [
            {
                type: "list",
                message: "Select a manager: ",
                name: "manager",
                choices: empArr
            }]
    ).then((response) => {
            let manID = getID(empRef, "fullastName", response, "manager")
            renderDB(`SELECT a.id, a.first_name,a.last_name, CONCAT(b.last_name," ",b.first_name) AS Manager FROM employees a  left JOIN employees b ON a.manager_id = b.id where a.manager_id= ${manID} ORDER BY a.id;`)
        })
}

async function employeeByDept(){
    let deptArr = [];
    let deptRef;
    await db.promise().query("select * from department").then((results) => {
        deptRef = results[0];
        results[0].forEach(element => {
            deptArr.push(element.dept_name)
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "Select a department: ",
            name: "department",
            choices: deptArr
        }]
    ).then((response) => {
            let deptID = getID(deptRef, "dept_name", response, "department")
            renderDB(`SELECT employees.id,first_name,last_name, roles.title,department.dept_name FROM employees  JOIN roles ON roles.id = employees.role_id JOIN department ON roles.department_id = department.id where department.id=${deptID} ORDER BY employees.id;`)
        })
}

//capitalizes the first letter of the string
function titleCase(string) {
    let titleCased = string.toLowerCase();
    titleCased = titleCased.split("");
    titleCased[0] = titleCased[0].toUpperCase();
    titleCased = titleCased.join("")
    return titleCased;
}

//implement dry code for finding ids 
function getID(reference, refCol, response, resCol) {
    let id = (reference.find(obj => obj[refCol] == response[resCol])).id
    return id;
}

mainMenuPrompt();