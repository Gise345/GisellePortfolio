<?php

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = 'f7e6e62bb3324f21bfe86bcc63ad97b1';
$url = "https://api.opencagedata.com/geocode/v1/json?q={$lat}+{$lon}&key={$apiKey}";

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => $url,
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_ENCODING => "",
    CURLOPT_MAXREDIRS => 10,
    CURLOPT_TIMEOUT => 30,
    CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
    CURLOPT_CUSTOMREQUEST => "GET",
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo json_encode(['error' => 'cURL Error: ' . $err]);
    exit;
}

$data = json_decode($response, true);

if (isset($data['results'][0]['components']['country_code'])) {
    $countryCode = strtoupper($data['results'][0]['components']['country_code']);

    $bordersData = json_decode(file_get_contents('countryBorders.geo.json'), true);

    foreach ($bordersData['features'] as $feature) {
        if ($feature['properties']['iso_a2'] === $countryCode) {
            echo json_encode(['borders' => $feature['geometry'], 'country' => $feature['properties']['name']]);
            exit;
        }
    }
}

echo json_encode(['error' => 'Country not found']);
