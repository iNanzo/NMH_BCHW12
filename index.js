/* Constants */
// Require
const mysql = require("mysql2");
const inquirer = require("inquirer");
const question = require("./src/questions")
require("dotenv").config();

// SQL Database Connection
//Diclaimer: If you are downloading this repository for your own use remember to set up an .env file along with populating the db/sql files.
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
                    case "View Lists":
                        viewPrompt();
                        break;
                    case "Add/Update Object":
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
                        renderDB("Select a.id, a.first_name,a.last_name, roles.title, department.dept_name, roles.salary, concat(b.last_name,\',\',b.first_name) as Manager from employees a join roles on roles.id = a.role_id join department on roles.department_id = department.id left join employees b on a.manager_id = b.id order by a.id;");
                        break;
                    case "View All Roles":
                        renderDB("Select roles.title, roles.id, department.dept_name, roles.salary from roles LEFT join department on department.id = roles.department_id order by roles.id;");
                        break;
                    case "View All Departments":
                        renderDB("Select * from department order by id;");
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
                reloadDB(`Insert into department (dept_name) values ("${response.name}")`);
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
                reloadDB(`Insert into roles (title, salary, department_id) values("${title}", "${salary}", "${id}")`);
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
    await db.promise().query("select id, concat(first_name, \' \', last_name) as fullastName from employees").then((results) => {
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
                reloadDB(`Insert into employees (first_name, last_name, role_id, manager_id) values("${firstName}", "${lastName}", "${roleId}", "${managerId}")`);
            })
}

// Update Function
async function updateManager(){
    var managerArray = [];
    var storedArray;

    await db.promise().query("select id, concat(first_name, \' \', last_name) as fullastName from employees").then((results) => {
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
            reloadDB(`Update employees set manager_id = ${managerID} where id = ${employeeID}`);
        })
}

/* Other */

// Sort Functions

async function employeeByManager(){
    var managerArray = [];
    var storedArray;

    await db.promise().query("select id, concat(first_name,\' \',last_name) as fullastName from employees").then((results) => {
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
            renderDB(`Select a.id, a.first_name,a.last_name, concat(b.last_name," ",b.first_name) as Manager from employees a left join employees b on a.manager_id = b.id where a.manager_id= ${manID} order by a.id;`)
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
            renderDB(`Select employees.id, first_name,last_name, roles.title, department.dept_name from employees join roles on roles.id = employees.role_id join department on roles.department_id = department.id where department.id=${deptID} order by employees.id;`)
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
        console.log("Successfully Added.");
    })
    mainMenuPrompt();
}

function getID(reference, ref, response, res){
    var id = (reference.find(obj => obj[ref] == response[res])).id;
    return id;
}

mainMenuPrompt();