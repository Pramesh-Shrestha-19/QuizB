<?php
header('Content-Type: application/json');
require_once __DIR__ . '/config.php';

session_start(); // Start session 

// --- CHECK IF REMEMBER ME COOKIE EXISTS ---
if(isset($_COOKIE['quizb_user']) && !isset($_SESSION['user_id'])) {
    $username = $_COOKIE['quizb_user'];

    // Query user by username from cookie
    $query = "SELECT user_id, username, email FROM user_info WHERE username = ?";         
    $stmt = $conn->prepare($query);                                                                      
    $stmt->bind_param("s", $username);                                                                     
    $stmt->execute();                                                                                      
    $result = $stmt->get_result();

    if($result->num_rows > 0) {
        $user = $result->fetch_assoc();
        $_SESSION['user_id'] = $user['user_id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['email'] = $user['email'];

        echo json_encode(["status" => "success", "message" => "Login restored via Remember Me", "user" => $user['username']]);
        exit;
    } 
    // If cookie invalid, ignore and proceed with normal login
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['username']) || !isset($data['password'])) {
    echo json_encode(["status" => "error", "message" => "Username and password required"]);
    exit;
}

$username = trim($data['username']);
$password = $data['password'];

// Query user
$query = "SELECT user_id, username, email, password FROM user_info WHERE username = ?";         
$stmt = $conn->prepare($query);                                                                      
$stmt->bind_param("s", $username);                                                                     
$stmt->execute();                                                                                      
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Invalid username or password"]);
    exit;
}

$user = $result->fetch_assoc();

// Verify password
if (password_verify($password, $user['password'])) {
    // Start session and store user info
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
