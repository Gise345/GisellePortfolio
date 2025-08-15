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
    $countryName = $data['results'][0]['components']['country'];
    echo json_encode(['countryCode' => $countryCode, 'countryName' => $countryName]);
} else {
    echo json_encode(['error' => 'Country not found']);
}
