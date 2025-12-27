<?php
session_start();
header('Content-Type: application/json');

if(isset($_SESSION['username'])) {
    echo json_encode(['status'=>'success','user'=>$_SESSION['username']]);
} else {
    echo json_encode(['status'=>'error']);
}
?>
