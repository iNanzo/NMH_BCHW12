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

/* Menu Functions */

// Main Prompts

function mainMenuPrompt(){
    inquirer.prompt(question.mainMenu)
        .then((response) => {
                switch(response.mainMenu) {
                    case "View":
                        viewPrompt();
                        break;

                    case "Add/Update":
                        addPrompt();
                        break;
                        
                    case "Quit":
                        console.log("Closing Application...");
                        process.kill(process.pid);
                        break;
                }
            })
}

function viewPrompt(){
    inquirer.prompt(question.viewMenu)
        .then((response) => {
                switch(response.viewMenu) {
                    case "View All Employees":
                        renderDB("SELECT a.id, a.first_name,a.last_name, roles.title, department.dept_name, roles.salary, CONCAT(b.last_name,\',\',b.first_name) AS Manager FROM employees a JOIN roles ON roles.id = a.role_id JOIN department ON roles.department_id = department.id left JOIN employees b ON a.manager_id = b.id ORDER BY a.id;");
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
                switch(response.auMenu) {
                    case "Add Employee":
                        AddEmployeeInput();
                        break;

                    case "Add Role":
                        addRoleInput();
                        break;

                    case "Add Department":
                        addDepartment();
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

// Add Prompts/Inputs
function addDepartment(){
    inquirer.prompt(question.addDepartment)
        .then((response) => {
                reloadDB(`INSERT INTO department (dept_name) VALUES ("${response.name}")`);
            })
}

function addRoleInput(){
    inquirer.prompt(question.addRole)
        .then((response) => {
                addRoleOutput(response.name, response.salary);
            })
}

function AddEmployeeInput(){
    inquirer.prompt(question.addEmployee)
        .then((response) => {
                addEmployeeOutput(response.firstName, response.lastName);
            })
}

// Add Outputs
async function addRoleOutput(title, salary){
    var deptArray = [];
    var reference;

    await db.promise().query("select * from department").then((results) => {
        reference = results[0];
        results[0].forEach(element => {
            deptArray.push(element.dept_name);
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "Which department does this role belong to?",
            name: "department",
            choices: deptArray
        }]
    )
        .then(
            (response) => {
                var id = getID(reference, "dept_name", response, "department");
                reloadDB(`INSERT INTO roles (title, salary, department_id) VALUES("${title}", "${salary}", "${id}")`);
            })
}

async function addEmployeeOutput(firstName, lastName){
    var roleArray = [];
    var storedRoleArray;
    var managerArray = [];
    var storedManagerArray;
    await db.promise().query("select id, title from roles order by id").then((results) => {
        storedRoleArray = results[0];
        storedRoleArray.forEach(element => {
            roleArray.push(element.title)
        })
    })
    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        storedManagerArray = results[0];
        results[0].forEach(element => {
            managerArray.push(element.fullastName)
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "What is the role of this employee?",
            name: "role",
            choices: roleArray
        },
        {
            type: "list",
            message: "Who this employee's manager?",
            name: "manager",
            choices: managerArray
        }
        ]
    )
        .then((response) => {
                var roleId = getID(storedRoleArray, "title", response, "role");
                var managerId = getID(storedManagerArray, "fullastName", response, "manager");
                reloadDB(`INSERT INTO employees (first_name, last_name, role_id, manager_id) VALUES("${firstName}", "${lastName}", "${roleId}", "${managerId}")`);
            })
}

// Update Function
async function updateManager(){
    var managerArray = [];
    var storedArray;

    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        storedArray = results[0];
        results[0].forEach(element => {
            managerArray.push(element.fullastName);
        })
    })

    inquirer.prompt(
        [{
            type: "list",
            message: "Select an employee: ",
            name: "employee",
            choices: managerArray
        },
        {
            type: "list",
            message: "Select a new manager: ",
            name: "manager",
            choices: managerArray
        }]
    ).then((response) => {
            var employeeID = getID(storedArray, "fullastName", response, "employee");
            var managerID = getID(storedArray, "fullastName", response, "manager");
            manipulateDB(`UPDATE employees set manager_id = ${managerID} where id = ${employeeID}`);
        })
}

/* Other */

// Sort Functions

async function employeeByManager(){
    var managerArray = [];
    var storedArray;

    await db.promise().query("select id, CONCAT(first_name,\' \',last_name) AS fullastName from employees").then((results) => {
        storedArray = results[0];
        results[0].forEach(element => {
            managerArray.push(element.fullastName)
        })
    })

    inquirer.prompt(
        [
            {
                type: "list",
                message: "Select a manager: ",
                name: "manager",
                choices: managerArray
            }]
    ).then((response) => {
            var manID = getID(storedArray, "fullastName", response, "manager")
            renderDB(`SELECT a.id, a.first_name,a.last_name, CONCAT(b.last_name," ",b.first_name) AS Manager FROM employees a  left JOIN employees b ON a.manager_id = b.id where a.manager_id= ${manID} ORDER BY a.id;`)
        })
}

async function employeeByDept(){
    var deptArray = [];
    var storedArray;
    await db.promise().query("select * from department").then((results) => {
        storedArray = results[0];
        results[0].forEach(element => {
            deptArray.push(element.dept_name)
        })
    })
    inquirer.prompt(
        [{
            type: "list",
            message: "Select a department: ",
            name: "department",
            choices: deptArray
        }]
    ).then((response) => {
            var deptID = getID(storedArray, "dept_name", response, "department")
            renderDB(`SELECT employees.id,first_name,last_name, roles.title,department.dept_name FROM employees  JOIN roles ON roles.id = employees.role_id JOIN department ON roles.department_id = department.id where department.id=${deptID} ORDER BY employees.id;`)
        })
}

// Render Functions

async function renderDB(dbQuery){
    await db.promise().query(dbQuery).then((results) => {
        console.table(results[0]);
    })
    mainMenuPrompt();
}

async function reloadDB(dbQuery){
    await db.promise().query(dbQuery).then(() => {
        console.log("Successfully Added.")
    })
    mainMenuPrompt();
}

function getID(reference, ref, response, res){
    var id = (reference.find(obj => obj[ref] == response[res])).id;
    return id;
}

mainMenuPrompt();