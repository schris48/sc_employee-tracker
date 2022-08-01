INSERT INTO departments(id, department_name)
VALUES
(001, "Management"),
(002, "Marketing"),
(003, "Engineering"),
(004, "Finance"),
(005, "Sales"),
(006, "HR"),
(007, "Retail"),
(008, "IT Services");

INSERT INTO roles (id, title, salary, department_id)
VALUES
(10, "CEO", 100.50, 001),
(11, "COO", 100.50, 001),
(12, "CFO", 3000000.50, 001),
(20, "Engineering Manager", 40.50, 002),
(21, "Software Manager", 40.10, 002),
(30, "Finance Director", 200.00, 003),
(15, "Software Engineering Lead", 168.00, 003),
(31, "Senior Engineer", 90.50, 003),
(32, "Junior Engineer", 80.50, 003),
(40, "Finance Manager", 60.08, 004),
(41, "Legal Consultant", 58.06, 004),
(50, "Marketing Manager", 5.05, 005),
(51, "Philanthropy Manager", 2.50, 005),
(52, "Philanthopy Assistant", 1.00, 005),
(60, "HR Manager", 20.08, 006),
(61, "HR Rep", 18.69, 006);

INSERT INTO employee (id, first_name, last_name, role_id, manager_id)
VALUES
(1000, "Sharon", "R", 3000, null),
(1001, "Lucas", "A", 10, null),
(1002, "Shashi", "G", 11, null),
(1003, "Laura", "H", 12, null),
(2001, "Amber", "B", 20, null),
(2002, "Dave", "I", 21, 2001),
(2003, "Dylan", "J", 21, 2001),
(2004, "Paul", "K", 21, 2001),
(3001, "Joshua", "C", 30, null),
(3002, "Amy", "L", 31, 3001),
(3003, "Kyle", "M", 32, 3001),
(3004, "Will", "N", 33, 3001),
(3005, "Jeffrey", "O", 33, 3001),
(3006, "Anna", "P", 33, 3001),
(4001, "Hannah", "D", 40, null),
(4002, "Hassan", "Q", 41, 4001),
(4003, "Ali", "R", 41, 4001),
(5001, "Manpreet", "E", 50, null),
(5002, "Justin", "S", 51, 5001),
(5003, "Holly", "T", 52, 5001),
(5004, "Reanne", "U", 52, 5001),
(6001, "Melissa", "F", 60, null),
(6002, "Jody", "U", 61, 6001),
(6003, "Carol", "V", 61, 6001),
(6004, "Abby", "W", 61, 6001);