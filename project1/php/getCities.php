<?php
$countryCode = $_GET['country'];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "http://api.geonames.org/searchJSON?country={$countryCode}&featureClass=P&maxRows=50&username=Giselle345&style=full",
    CURLOPT_RETURNTRANSFER => true,
]);

$response = curl_exec($curl);
$err = curl_error($curl);

curl_close($curl);

if ($err) {
    echo json_encode(['error' => $err]);
} else {
    $data = json_decode($response, true);
    $cities = array_map(function($city) {
        return [
            'name' => $city['name'],
            'lat' => $city['lat'],
            'lng' => $city['lng'],
        ];
    }, $data['geonames']);
    
    header('Content-Type: application/json');
    echo json_encode($cities);
}
