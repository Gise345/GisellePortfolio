<?php
$countryBordersFile = 'countryBorders.geo.json';
$jsonData = file_get_contents($countryBordersFile);
$data = json_decode($jsonData, true);

$countries = [];
foreach ($data['features'] as $feature) {
    $countries[$feature['properties']['iso_a2']] = $feature['properties']['name'];
}

header('Content-Type: application/json');
echo json_encode($countries);

