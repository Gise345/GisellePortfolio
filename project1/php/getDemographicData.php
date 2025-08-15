<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json');

$countryCode = $_GET['country'] ?? null;

if (!$countryCode) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

$url = "https://restcountries.com/v3.1/alpha/{$countryCode}";

$response = file_get_contents($url);
$data = json_decode($response, true);

if ($data) {
    $country = $data[0];
    echo json_encode([
        'population' => $country['population'],
        'capital' => $country['capital'][0] ?? 'N/A',
        'languages' => array_values($country['languages'] ?? []),
        'region' => $country['region']
    ]);
} else {
    echo json_encode(['error' => 'Demographic data not available']);
}
