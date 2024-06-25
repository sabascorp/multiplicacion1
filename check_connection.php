<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "multiplication1_practice";

$conn = new mysqli($servername, $username, $password, $dbname);

header('Content-Type: application/json');

if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Fallo la conexión: ' . $conn->connect_error]);
} else {
    echo json_encode(['status' => 'success', 'message' => 'Conexión exitosa']);
}

$conn->close();
?>
