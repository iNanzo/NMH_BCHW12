/* Menus */
// Main Menu
const mainMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "mainMenu",
    choices: ["View Lists", "Add/Update Object", "Quit"]
}]

// Sub Menus
const viewMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "viewMenu",
    choices: ["View All Employees", "View All Roles", "View All Departments", "View Employees By Manager", "View Employees By Department", "<"]
}]

const auMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "auMenu",
    choices: ["Add Employee", "Add Role", "Add Department", "Update Employee Manager", "<"]
}]

/* Prompts */
// Add Prompts
const addEmployee = [{
    type: "input",
    message: "What is the employee's first name?",
    name: "firstName"
},
{
    type: "input",
    message: "What is the employee's last name?",
    name: "lastName"
}]

const addRole = [{
    type: "input",
    message: "What is the name of the role?",
    name: "name"
},
{
    type: "input",
    message: "What is the salary of the role?",
    name: "salary",
}]

const addDepartment = [{
    type: "input",
    message: "Which department does the role belong to?",
    name: "name"
}]

module.exports = {
    mainMenu, viewMenu, auMenu, addEmployee, addRole, addDepartment
}