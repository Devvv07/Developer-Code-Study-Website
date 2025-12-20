
CREATE DATABASE IF NOT EXISTS code_ninja_db;


USE code_ninja_db;


CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(15) NOT NULL,
    quiz_name VARCHAR(100) NOT NULL,
    score INT DEFAULT 0,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

select * from users;

delete from users WHERE name='dev';