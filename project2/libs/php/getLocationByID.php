<?php

	// example use from browser
	// http://localhost/companydirectory/libs/php/getLocationByID.php?id=<id>

	// remove next two lines for production	

$executionStartTime = microtime(true);
include("config.php");

header('Content-Type: application/json; charset=UTF-8');

$conn = new mysqli($cd_host, $cd_user, $cd_password, $cd_dbname, $cd_port, $cd_socket);

if (mysqli_connect_errno()) {
    $output['status']['code'] = "300";
    $output['status']['name'] = "failure";
    $output['status']['description'] = "database unavailable";
    $output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
    $output['data'] = [];
    mysqli_close($conn);
    echo json_encode($output);
    exit;
}

$query = $conn->prepare('SELECT id, name FROM location WHERE id = ?');
$query->bind_param("i", $_POST['id']);
$query->execute();
$result = $query->get_result();
$row = $result->fetch_assoc();

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) / 1000 . " ms";
$output['data'] = [$row];

mysqli_close($conn);
echo json_encode($output);
