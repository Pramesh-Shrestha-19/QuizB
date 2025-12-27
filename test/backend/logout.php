<?php
session_start();
header('Content-Type: application/json');

// --- CLEAR REMEMBER ME COOKIE ---
setcookie('quizb_user', '', time() - 3600, "/"); // remove cookie

session_destroy();
echo json_encode(["status" => "success", "message" => "Logged out successfully"]);
?>
