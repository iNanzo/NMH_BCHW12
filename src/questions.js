//menus
const mainMenu = [{
    type: "list",
    message: "Select an option from the choices below: ",
    name: 'mainMenu',
    choices: ["View", "Add", "Update", "Quit"]
}]

const viewMenu = [{
    type: "list",
    message: "Select an option from the choices below: ",
    name: 'viewMenu',
    choices: ["View All Departments", "View All Roles", "View All Employees", "View Employee By Manager", "View Employees By Department", "Back"]
}]

const addMenu = [{
    type: "list",
    message: "Select an option from the choices below: ",
    name: 'addMenu',
    choices: ["Add A Department", "Add A Role", "Add An Employee", "Back"]
}]

const updateMenu = [{
    type: "list",
    message: "Select an option from the choices below: ",
    name: 'updateMenu',
    choices: ["Update Employee Role", "Update Employee Manager", "Back"]
}]

//adding inqs

const addDept = [{
    type: "input",
    message: "What is the name of the department?",
    name: "name"
}]

const addRole = [{
    type: "input",
    message: "What is the name?",
    name: "name"
},
{
    type: "input",
    message: "What is the salary?",
    name: "salary",
}
]

const addEmp = [{
    type: "input",
    message: "What is the employee's first name?",
    name: "fName"
},
{
    type: "input",
    message: "What is the employee's last name?",
    name: "lName"
}]

module.exports = { mainMenu, viewMenu, addMenu, updateMenu, addDept, addRole, addEmp }