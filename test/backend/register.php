<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validation
if (!isset($data['username']) || !isset($data['email']) || !isset($data['password']) || !isset($data['confirmPassword'])) {
    echo json_encode(["status" => "error", "message" => "All fields are required"]);
    exit;
}

$username = trim($data['username']);
$email = trim($data['email']);
$password = $data['password'];
$confirmPassword = $data['confirmPassword'];

// Basic validation
if (strlen($username) < 3) {
    echo json_encode(["status" => "error", "message" => "Username must be at least 3 characters"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["status" => "error", "message" => "Invalid email format"]);
    exit;
}

if (strlen($password) < 6) {
    echo json_encode(["status" => "error", "message" => "Password must be at least 6 characters"]);
    exit;
}

if ($password !== $confirmPassword) {
    echo json_encode(["status" => "error", "message" => "Passwords don't match"]);
    exit;
}

// Hash password
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Check if username or email already exists
$checkQuery = "SELECT * FROM user_info WHERE username = ? OR email = ?";
$stmt = $conn->prepare($checkQuery);
$stmt->bind_param("ss", $username, $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Username or email already exists"]);
    exit;
}

// Insert new user
$insertQuery = "INSERT INTO user_info (username, email, password) VALUES (?, ?, ?)";
$stmt = $conn->prepare($insertQuery);
$stmt->bind_param("sss", $username, $email, $hashedPassword);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Registration successful! Please log in."]);
} else {
    echo json_encode(["status" => "error", "message" => "Registration failed: " . $conn->error]);
}

$stmt->close();
$conn->close();
?>
