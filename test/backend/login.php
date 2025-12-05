<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Username and password required"]);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

// Query user
$query = "SELECT user_id, username, email, password FROM user_info WHERE username = ?";         
$stmt = $conn->prepare($query);                                                                         // SQL injection protection. fully wraps the placeholder so when the data is entered it will be as data value and not as a sql command.
$stmt->bind_param("s", $username);                                                                      // Insert the data(username) into the placeholder(?). 
$stmt->execute();                                                                                       // Execute the query.
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (password_verify($password, $user['password'])) {
    // Start session and store user info
    session_start();
    $_SESSION['user_id'] = $user['user_id'];
    $_SESSION['username'] = $user['username'];
    $_SESSION['email'] = $user['email'];
    
    echo json_encode(["status" => "success", "message" => "Login successful", "user" => $user['username']]);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
}

$stmt->close();
$conn->close();
?>