const mysql = require('mysql2');
const inquirer = require('inquirer');
const cTable = require('console.table');
const chalk = require('chalk');
const figlet = require('figlet');
const promisemysql = require("promise-mysql");
const { connectionProperties, connection } = require('./config/connection');

// db connection
connection.connect(err => {
    if (err) {
        return console.error('error: ' + err.message);
    }

    console.log(chalk.pink.bold(`==============================================================================================`));
    console.log(``);
    console.log(chalk.black.bold(figlet.textSync('Employee Tracker')));
    console.log(``);
    console.log(`                                                                    ` + chalk.blue.bold('Created By: Priya Ravi'));
    console.log(``);
    console.log(chalk.pink.bold(`==============================================================================================`));    mainMenu();
});

function primaryMenu() {
    inquirer
        .prompt({
            name: "userAction",
            type: "list",
            message: "Choose an action.",
            choices: [
                "View all departments",
                "View all employees",
                "View all roles",
                "View all employees by manager",
                "View all employees by department",
                "Add a department",
                "Add a role",
                "Add an employee",
                "Update employee role",
                "Update employee manager",
                "Delete employee",
                "Delete role",
                "Delete department",
                "View department budgets",
                "Exit"
            ]
        })

        .then(response => {
            switch (response.userAction) {
                case "View all departments":
                    viewDepartments();
                    break;
                case "View all employees":
                    viewEmployees();
                    break;
                case "View all roles":
                    viewRoles();
                    break;
                case "View all employees by manager":
                    viewAllEmployeesByManager();
                    break;
                case "View all employees by department":
                    viewAllEmployeeByDepartment();
                    break;
                case "Add a department":
                    addDept();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Update employee role":
                    updateEmployeeRole();
                    break;
                case "Update employee manager":
                    updateEmployeeManager();
                    break;
                case "Delete employee":
                    deleteEmployee();
                    break;
                case "Delete role":
                    deleteRole();
                    break;
                case "Delete department":
                    deleteDepartment();
                    break;
                case "View department budgets":
                    viewDeptBudget();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });

    function viewDepartments() {
        let query = "SELECT * FROM  departments";
        connection.query(query, function(err, res) {
            console.log(chalk.yellow.bold(`====================================================================================`));
            console.log(`                              ` + chalk.green.bold(`All Departments:`));
            console.log(chalk.yellow.bold(`====================================================================================`));

            console.table(res);
            primaryMenu();
        });
    };

    function viewEmployees() {
        let query = "SELECT e.id, e.first_name, e.last_name, roles.title, departments.department_name AS department, roles.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN roles ON e.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id ORDER BY id ASC";
        connection.query(query, function(err, res) {
            console.log(chalk.yellow.bold(`====================================================================================`));
            console.log(`                              ` + chalk.green.bold(`Current Employees:`));
            console.log(chalk.yellow.bold(`====================================================================================`));

            console.table(res);
            primaryMenu();
        });
    };

    function viewRoles() {
        let query = `SELECT roles.id, roles.title, departments.department_name AS department, roles.salary
                  FROM roles
                  INNER JOIN departments ON roles.department_id = departments.id`;

        connection.query(query, function(err, res) {
            console.log(chalk.yellow.bold(`====================================================================================`));
            console.log(`                              ` + chalk.green.bold(`Current Employee Roles:`));
            console.log(chalk.yellow.bold(`====================================================================================`));

            console.table(res);
            primaryMenu();
        });
    };

    function viewAllEmployeesByManager() {

        // set manager array
        let managerArr = [];

        // Create connection using promise-sql
        promisemysql.createConnection(connectionProperties)
            .then((conn) => {

                // Query all employees
                return conn.query("SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id");

            }).then(function(managers){

            // place all employees in array
            for (i=0; i < managers.length; i++){
                managerArr.push(managers[i].manager);
            }

            return managers;
        }).then((managers) => {

            inquirer.prompt({

                // Prompt user of manager
                name: "manager",
                type: "list",
                message: "Which manager would you like to search?",
                choices: managerArr
            })
                .then((answer) => {

                    let managerID;

                    // get ID of manager selected
                    for (i=0; i < managers.length; i++){
                        if (answer.manager == managers[i].manager){
                            managerID = managers[i].id;
                        }
                    }

                    // query all employees by selected manager
                    const query = `SELECT e.id, e.first_name, e.last_name, roles.title, departments.department_name AS department, roles.salary, concat(m.first_name, ' ' ,  m.last_name) AS manager
            FROM employee e
            LEFT JOIN employee m ON e.manager_id = m.id
            INNER JOIN roles ON e.role_id = roles.id
            INNER JOIN departments ON roles.department_id = departments.id
            WHERE e.manager_id = ${managerID};`;

                    connection.query(query, (err, res) => {
                        if(err) return err;

                        // display results with console.table
                        console.log("\n");
                        console.log(chalk.yellow.bold(`====================================================================================`));
                        console.log(`                              ` + chalk.green.bold(`Employees by Manager:`));
                        console.log(chalk.yellow.bold(`====================================================================================`));

                        console.table(res);

                        // back to main menu
                        primaryMenu();
                    });
                });
        });
    }

    function viewAllEmpByDept() {

        // Set global array to store department names
        let deptArr = [];

        // Create new connection using promise-sql
        promisemysql.createConnection(connectionProperties
        ).then((conn) => {

            // Query just names of departments
            return conn.query('SELECT department_name FROM departments');
        }).then(function(value) {

            // Place all names within deptArr
            deptQuery = value;
            for (i=0; i < value.length; i++){
                deptArr.push(value[i].department_name);

            }
        }).then(() => {

            // Prompt user to select department from array of departments
            inquirer.prompt({
                name: "department",
                type: "list",
                message: "Which department would you like to search?",
                choices: deptArr
            })
                .then((answer) => {

                    // Query all employees depending on selected department
                    const query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', roles.title AS Title, departments.department_name AS Department, roles.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN roles ON e.role_id = roles.id INNER JOIN departments ON roles.department_id = departments.id WHERE departments.department_name = '${answer.department}' ORDER BY id ASC`;
                    connection.query(query, (err, res) => {
                        if(err) return err;

                        // Show results in console.table
                        console.log("\n");

                        console.log(chalk.yellow.bold(`====================================================================================`));
                        console.log(`                              ` + chalk.green.bold(`Employees by Department:`));
                        console.log(chalk.yellow.bold(`====================================================================================`));

                        console.table(res);

                        // Back to main menu
                        primaryMenu();
                    });
                });
        });
    }

    function addDept() {
        inquirer
            .prompt([
                {
                    name: "deptID",
                    type: "input",
                    message: "What is the ID of the new department?",
                },
                {
                    name: "deptName",
                    type: "input",
                    message: "What is the name of the new department?",
                }
            ])

            .then(function(response) {
                connection.query("INSERT INTO departments SET ?", {
                        id: response.deptID,
                        department_name: response.deptName,
                    },
                    function(err) {
                        if (err) throw err;
                        console.log("Your department was created successfully!");
                        primaryMenu();
                    }
                );
            });
    };

    function addRole() {
        inquirer
            .prompt([
                {
                    name: "roleID",
                    type: "input",
                    message: "What is the ID of the new role?",
                },
                {
                    name: "roleTtile",
                    type: "input",
                    message: "What is the title of the new role?",
                },
                {
                    name: "roleSalary",
                    type: "input",
                    message: "What is the salary of the new role?",
                },
                {
                    name: "roleDepartment",
                    type: "input",
                    message: "What is the department ID of the new role?",
                }
            ])

            .then(function(response) {
                connection.query("INSERT INTO roles SET ?", {
                        id: response.roleID,
                        title: response.roleTtile,
                        salary: response.roleSalary,
                        department_id: response.roleDepartment,
                    },
                    function(err) {
                        if (err) throw err;
                        console.log("Your new role was created successfully!");
                        primaryMenu();
                    }
                );
            });
    };

    function addEmployee() {
        inquirer
            .prompt([
                {
                    name: "employeeID",
                    type: "input",
                    message: "What is the ID of the new employee?",
                },
                {
                    name: "empFirstName",
                    type: "input",
                    message: "What is the first name of the new employee?",
                },
                {
                    name: "empLastName",
                    type: "input",
                    message: "What is the last name of the new employee?",
                },
                {
                    name: "empRole",
                    type: "input",
                    message: "What is the role ID for the new employee?",
                },
                {
                    name: "empManager",
                    type: "input",
                    message: "What is id of the new employee's manager?",
                }
            ])

            .then(function(response) {
                connection.query("INSERT INTO employee SET ?", {
                        id: response.employeeID,
                        first_name: response.empFirstName,
                        last_name: response.empLastName,
                        role_id: response.empRole,
                        manager_id: response.empManager,
                    },
                    function(err) {
                        if (err) throw err;
                        console.log("Your new employee was created successfully!");
                        primaryMenu();
                    }
                );
            });
    };

    function updateEmployeeRole() {

        // create employee and role array
        let employeeArr = [];
        let roleArr = [];

        // Create connection using promise-sql
        promisemysql.createConnection(connectionProperties
        ).then((conn) => {
            return Promise.all([

                // query all roles and employee
                conn.query('SELECT id, title FROM roles ORDER BY title ASC'),
                conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
            ]);
        }).then(([roles, employees]) => {

            // place all roles in array
            for (i=0; i < roles.length; i++){
                roleArr.push(roles[i].title);
            }

            // place all empoyees in array
            for (i=0; i < employees.length; i++){
                employeeArr.push(employees[i].Employee);
                //console.log(value[i].name);
            }

            return Promise.all([roles, employees]);
        }).then(([roles, employees]) => {

            inquirer.prompt([
                {
                    // prompt user to select employee
                    name: "employee",
                    type: "list",
                    message: "Who would you like to edit?",
                    choices: employeeArr
                }, {
                    // Select role to update employee
                    name: "role",
                    type: "list",
                    message: "What is their new role?",
                    choices: roleArr
                },]).then((answer) => {

                let roleID;
                let employeeID;

                /// get ID of role selected
                for (i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // get ID of employee selected
                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }

                // update employee with new role
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    // confirm update employee
                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);

                    // back to main menu
                    primaryMenu();
                });
            });
        });

    }

    function updateEmployeeManager() {

        let employeeArr = [];

        connection.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC", function (err, employees) {
            // place employees in array
            for (i=0; i < employees.length; i++){
                employeeArr.push(employees[i].Employee);
            }

            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Who would you like to edit?",
                    choices: employeeArr
                }, {
                    // prompt user to select new manager
                    name: "manager",
                    type: "list",
                    message: "Who is their new Manager?",
                    choices: employeeArr
                },]).then((answer) => {

                let employeeID;
                let managerID;

                // get ID of selected manager
                for (i=0; i < employees.length; i++){
                    if (answer.manager == employees[i].Employee){
                        managerID = employees[i].id;
                    }
                }

                for (i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }


                connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;


                    console.log(`\n ${answer.employee} MANAGER UPDATED TO ${answer.manager}...\n`);


                    primaryMenu();
                });
            });
        });

    }

    function deleteEmployee() {

        let employeeArr = [];

        connection.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC", function(err, res) {

            for (i = 0; i < res.length; i++) {
                employeeArr.push(res[i].employee);
            }

            inquirer.prompt([
                {
                    name: "employee",
                    type: "list",
                    message: "Choose an employee",
                    choices: employeeArr
                }, {

                    name: "yesNo",
                    type: "list",
                    message: "Confirm deletion",
                    choices: ["NO", "YES"]
                }]).then((answer) => {

                if (answer.yesNo == "YES") {
                    let employeeID;


                    for (i = 0; i < res.length; i++) {
                        if (answer.employee == res[i].employee) {
                            employeeID = res[i].id;
                        }
                    }


                    connection.query(`DELETE FROM employee WHERE id=${employeeID};`, (err, res) => {
                        if (err) return err;


                        console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);


                        primaryMenu();
                    });
                }
                else {


                    console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);


                    primaryMenu();
                }

            });
        })
    }

    function deleteRole() {


        let roleArr = [];


        connection.query("SELECT roles.id, title FROM roles", function (err, res) {

            for (i = 0; i < res.length; i++) {
                roleArr.push(res[i].title);
            }

            inquirer.prompt([{

                name: "continueDelete",
                type: "list",
                message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
                choices: ["NO", "YES"]
            }]).then((answer) => {


                if (answer.continueDelete === "NO") {
                    primaryMenu();
                }

            }).then(() => {

                inquirer.prompt([{
                    name: "role",
                    type: "list",
                    message: "Choose role to delete?",
                    choices: roleArr
                }, {
                    name: "confirmDelete",
                    type: "Input",
                    message: "Type the role title confirm deletion of the role"

                }]).then((answer) => {

                    if (answer.confirmDelete === answer.role) {

                        // get role id of of selected role
                        let roleID;
                        for (i=0; i < res.length; i++){
                            if (answer.role == res[i].title){
                                roleID = res[i].id;
                            }
                        }

                        // delete role
                        connection.query(`DELETE FROM roles WHERE id=${roleID};`, (err, res) => {
                            if(err) return err;

                            // confirm role has been added
                            console.log(`\n ROLE '${answer.role}' DELETED...\n `);

                            //back to main menu
                            primaryMenu();
                        });
                    }
                    else {

                        // if not confirmed, do not delete
                        console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);

                        //back to main menu
                        primaryMenu();
                    }
                });
            })
        });
    }

    function deleteDepartment() {

        // department array
        let deptArr = [];

        connection.query("SELECT id, department_name FROM departments", function (err, depts) {
            // add all departments to array
            for (i=0; i < depts.length; i++){
                deptArr.push(depts[i].department_name);
            }

            inquirer.prompt([{

                // confirm to continue to select department to delete
                name: "continueDelete",
                type: "list",
                message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
                choices: ["NO", "YES"]
            }]).then((answer) => {

                // if not, go back to main menu
                if (answer.continueDelete === "NO") {
                    primaryMenu();
                }

            }).then(() => {

                inquirer.prompt([{

                    // prompt user to select department
                    name: "dept",
                    type: "list",
                    message: "Choose department to delete",
                    choices: deptArr
                }, {

                    name: "confirmDelete",
                    type: "Input",
                    message: "Type department name confirm deletion of the department: "

                }]).then((answer) => {

                    if (answer.confirmDelete === answer.dept){

                        let deptID;
                        for (i=0; i < depts.length; i++){
                            if (answer.dept == depts[i].department_name){
                                deptID = depts[i].id;
                            }
                        }

                        connection.query(`DELETE FROM departments WHERE id=${deptID};`, (err, res) => {
                            if(err) return err;

                            console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);

                            primaryMenu();
                        });
                    }
                    else {

                        console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);


                        primaryMenu();
                    }

                });
            })
        });
    }


    function viewDeptBudget() {
        console.log(chalk.yellow.bold(`====================================================================================`));
        console.log(`                              ` + chalk.green.bold(`Budget By Department:`));
        console.log(chalk.yellow.bold(`====================================================================================`));

        const sql =     `SELECT department_id AS id, 
                  departments.department_name AS department,
                  SUM(salary) AS budget
                  FROM  roles 
                  INNER JOIN departments ON roles.department_id = departments.id GROUP BY roles.department_id`;
        connection.query(sql, (error, response) => {
            if (error) throw error;
            console.table(response);
            console.log(chalk.yellow.bold(`====================================================================================`));


            primaryMenu();
        });
    }
}