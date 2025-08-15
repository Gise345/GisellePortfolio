<?php
$countryCode = $_GET['country'];
$bordersFile = 'countryBorders.geo.json';

$jsonData = file_get_contents($bordersFile);
$data = json_decode($jsonData, true);

$countryBorder = null;
foreach ($data['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $countryCode) {
        $countryBorder = $feature['geometry'];
        break;
    }
}

if ($countryBorder) {
    echo json_encode($countryBorder);
} else {
    echo json_encode(['error' => 'Country borders not found']);
}
