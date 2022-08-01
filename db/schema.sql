DROP TABLE IF EXISTS departments;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS employee;

CREATE TABLE departments (
  id INT NOT NULL,
  department_name VARCHAR(35) NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE roles (
  id INT NOT NULL,
  title VARCHAR(30) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  department_id INT UNSIGNED NOT NULL REFERENCES departments(id),
  PRIMARY KEY (id)
);

CREATE TABLE employee (
  id INT NOT NULL,
  first_name VARCHAR(35) NOT NULL,
  last_name VARCHAR(35) NOT NULL,
  role_id INT UNSIGNED NOT NULL REFERENCES roles(id),
  manager_id INT UNSIGNED REFERENCES manager(id),
  PRIMARY KEY (id)
);