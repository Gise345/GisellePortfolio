<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

$countryCode = isset($_GET['country']) ? $_GET['country'] : '';
if (empty($countryCode)) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

$username = 'Giselle345';

$url = "http://api.geonames.org/searchJSON?country={$countryCode}&featureCode=AIRP&maxRows=50&username={$username}";

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
    error_log("cURL Error in getAirports.php: " . $err);
    echo json_encode(['error' => $err]);
} else {
    $data = json_decode($response, true);
    if (isset($data['geonames']) && is_array($data['geonames'])) {
        $airports = array_map(function($airport) {
            return [
                'name' => $airport['name'],
                'lat' => $airport['lat'],
                'lng' => $airport['lng'],
                'iata' => $airport['alternateNames'][0]['name'] ?? 'N/A'
            ];
        }, $data['geonames']);
        echo json_encode($airports);
    } else {
        error_log("Invalid or empty response from Geonames API: " . $response);
        echo json_encode(['error' => 'Invalid or empty response from Geonames API']);
    }
}
