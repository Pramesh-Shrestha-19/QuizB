<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "quizb_db";

// Create connection
$conn = new mysqli($servername, $username, $password);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Connection failed: " . $conn->connect_error]));
}

// Create database if it doesn't exist
$sql = "CREATE DATABASE IF NOT EXISTS quizb_db";
if ($conn->query($sql) === TRUE) {
    // Database created or already exists
} else {
    die(json_encode(["status" => "error", "message" => "Error creating database: " . $conn->error]));
}

// Select the database
$conn->select_db($dbname);

// Create user_info table if it doesn't exist
$createTable = "CREATE TABLE IF NOT EXISTS user_info (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)";

if ($conn->query($createTable) === TRUE) {
    // Table created or already exists
} else {
    die(json_encode(["status" => "error", "message" => "Error creating table: " . $conn->error]));
}
?>