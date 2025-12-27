<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'PHPMailer/src/Exception.php';
require 'PHPMailer/src/PHPMailer.php';
require 'PHPMailer/src/SMTP.php';

// Always return JSON
header('Content-Type: application/json');

// Include database config
require_once __DIR__ . '/config.php';

// Get HTTP method and input data
$method = $_SERVER['REQUEST_METHOD'];
$data = json_decode(file_get_contents("php://input"), true);

// Helper function to respond and exit
function respond($status, $message) {
    echo json_encode(['status' => $status, 'message' => $message]);
    exit;
}

// ===== POST: Request Reset Code =====
if ($method === 'POST') {
    $email = $data['email'] ?? '';
    if (!$email) respond('error', 'Email required');

    $stmt = $conn->prepare("SELECT user_id FROM user_info WHERE email=?");
    if (!$stmt) respond('error', 'Database error: '.$conn->error);

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        // Do not reveal if email exists
        respond('success', 'If email exists, a reset code will be sent');
    }

    $user = $result->fetch_assoc();
    $user_id = $user['user_id'];

    // Generate a 6-digit code
    $reset_code = str_pad(random_int(100000, 999999), 6, '0', STR_PAD_LEFT);

    // Use MySQL's DATE_ADD to avoid timezone issues
    $stmt = $conn->prepare("INSERT INTO password_resets (user_id, reset_code, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 30 MINUTE))");
    if (!$stmt) respond('error', 'Database error: '.$conn->error);

    $stmt->bind_param("is", $user_id, $reset_code);
    $stmt->execute();

    $mail = new PHPMailer(true);
    try {
        //Server settings
        $mail->isSMTP();
        $mail->Host       = 'smtp.gmail.com';
        $mail->SMTPAuth   = true;
        $mail->Username   = 'quizb.notifications@gmail.com';
        $mail->Password   = 'etjp zgbq ieur jvow';
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = 587;

        //Recipients
        $mail->setFrom('quizb.notifications@gmail.com', 'QuizB');
        $mail->addAddress($email);

        //Content
        $mail->isHTML(true);
        $mail->Subject = 'Password Reset Code - QuizB';
        $mail->Body    = "
            <h2>Password Reset Request</h2>
            <p>Your password reset code is:</p>
            <h1 style='color: #4CAF50; letter-spacing: 5px;'>$reset_code</h1>
            <p>This code expires in 30 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>- QuizB Team 🐝</p>
        ";

        $mail->send();
        respond('success', 'Reset code sent to your email! Check your inbox.');
    } catch (Exception $e) {
        respond('error', 'Failed to send email: ' . $mail->ErrorInfo);
    }
}

// ===== PUT: Reset Password =====
if ($method === 'PUT') {
    $email = $data['email'] ?? '';
    $code = $data['code'] ?? '';
    $newPassword = $data['newPassword'] ?? '';

    if (!$email || !$code || !$newPassword) respond('error', 'All fields required');

    // Get user
    $stmt = $conn->prepare("SELECT user_id FROM user_info WHERE email=?");
    if (!$stmt) respond('error', 'Database error: '.$conn->error);

    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) respond('error', 'User not found');

    $user = $result->fetch_assoc();
    $user_id = $user['user_id'];

    // Verify reset code
    $stmt = $conn->prepare("SELECT * FROM password_resets WHERE user_id=? AND reset_code=? AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1");
    if (!$stmt) respond('error', 'Database error: '.$conn->error);

    $stmt->bind_param("is", $user_id, $code);
    $stmt->execute();
    $res = $stmt->get_result();

    if ($res->num_rows === 0) {
        // Check if code exists but expired
        $stmt2 = $conn->prepare("SELECT expires_at FROM password_resets WHERE user_id=? AND reset_code=?");
        $stmt2->bind_param("is", $user_id, $code);
        $stmt2->execute();
        $res2 = $stmt2->get_result();
        
        if ($res2->num_rows > 0) {
            respond('error', 'Reset code has expired. Please request a new one.');
        } else {
            respond('error', 'Invalid reset code. Please check and try again.');
        }
    }

    // Update password
    $hashed = password_hash($newPassword, PASSWORD_DEFAULT);
    $stmt = $conn->prepare("UPDATE user_info SET password=? WHERE user_id=?");
    if (!$stmt) respond('error', 'Database error: '.$conn->error);

    $stmt->bind_param("si", $hashed, $user_id);
    $stmt->execute();

    // Delete used reset code
    $stmt = $conn->prepare("DELETE FROM password_resets WHERE user_id=? AND reset_code=?");
    if ($stmt) {
        $stmt->bind_param("is", $user_id, $code);
        $stmt->execute();
    }

    respond('success', 'Password reset successful! You can now log in with your new password.');
}

// ===== Unsupported Method =====
respond('error', 'Unsupported request method');

// NOTE: No closing ?> tag to avoid accidental whitespace output