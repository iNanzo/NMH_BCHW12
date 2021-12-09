//menus
const mainMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "mainMenu",
    choices: ["View", "Add/Update", "Quit"]
}]

const viewMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "viewMenu",
    choices: ["View All Employees", "View All Roles", "View All Departments", "View Employee By Manager", "View Employees By Department", "<"]
}]

const auMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "auMenu",
    choices: ["Add Employee", "Add Role", "Add Department", "Update Employee Manager", "<"]
}]

const updateMenu = [{
    type: "list",
    message: "What would you like to do?",
    name: "updateMenu",
    choices: ["Update Employee Manager", "<"]
}]

const addDepartment = [{
    type: "input",
    message: "Which department does the role belong to?",
    name: "name"
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
}
]

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

module.exports = {
    mainMenu, viewMenu, auMenu, updateMenu, addDepartment, addRole, addEmployee
}