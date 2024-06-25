<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "multiplication1_practice";

// Crear conexión
$conn = new mysqli($servername, $username, $password, $dbname);

// Configurar el encabezado para devolver JSON
header('Content-Type: application/json');

// Verificar la conexión
if ($conn->connect_error) {
    echo json_encode(['status' => 'error', 'message' => 'Fallo la conexión: ' . $conn->connect_error]);
    exit();
}

// Función para convertir el formato de fecha
function convertirFormatoFecha($fechaInput) {
    // Reemplazar caracteres especiales
    $fechaInput = str_replace(['.', ' a.m.', ' p.m.'], ['', ' AM', ' PM'], $fechaInput);
    
    // Crear un objeto DateTime desde el formato d/m/Y, g:i:s A
    $dateTime = DateTime::createFromFormat('j/n/Y, g:i:s A', $fechaInput);
    
    // Verificar si la conversión fue exitosa
    if ($dateTime === false) {
        return false;
    }
    
    // Retornar la fecha en formato Y-m-d H:i:s
    return $dateTime->format('Y-m-d H:i:s');
}

// Obtener y sanitizar los datos del formulario
$userName = $conn->real_escape_string($_POST['username']);
$dateInput = $_POST['date'];
$correct = intval($_POST['correct']);
$wrong = intval($_POST['wrong']);
$attempts = intval($_POST['attempts']);
$difference = intval($_POST['difference']);
$classification = $conn->real_escape_string($_POST['classification']);

// Depuración: imprimir el valor de la fecha recibida
// Esto es solo para fines de depuración, recuerda eliminarlo en producción
error_log("Fecha recibida: " . $dateInput);

// Convertir el formato de la fecha
$date = convertirFormatoFecha($dateInput);

// Verificar si la conversión fue exitosa
if ($date === false) {
    echo json_encode(['status' => 'error', 'message' => 'Formato de fecha inválido: ' . $dateInput]);
    exit();
}

// Preparar la consulta SQL usando declaraciones preparadas
$sql = $conn->prepare("INSERT INTO results (username, date, correct, wrong, attempts, difference, classification) VALUES (?, ?, ?, ?, ?, ?, ?)");
$sql->bind_param("ssiiiis", $userName, $date, $correct, $wrong, $attempts, $difference, $classification);

// Ejecutar la consulta y verificar el resultado
if ($sql->execute() === TRUE) {
    echo json_encode(['status' => 'success', 'message' => 'Resultados guardados exitosamente']);
} else {
    echo json_encode(['status' => 'error', 'message' => 'Error al guardar los resultados: ' . $conn->error]);
}

// Cerrar la conexión
$conn->close();
?>
