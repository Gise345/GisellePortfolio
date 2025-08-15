<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryCode = isset($_GET['country']) ? $_GET['country'] : '';
if (empty($countryCode)) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

$username = 'Giselle345';
// Using feature code 'PK' for peaks/mountains
$url = "http://api.geonames.org/searchJSON?country={$countryCode}&featureCode=PK&style=FULL&maxRows=50&username={$username}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);

$result = curl_exec($ch);

curl_close($ch);

$decode = json_decode($result, true);

$mountains = [];
if (isset($decode['geonames']) && is_array($decode['geonames'])) {
    foreach ($decode['geonames'] as $mountain) {
        $mountains[] = [
            'name' => $mountain['name'],
            'lat' => floatval($mountain['lat']),
            'lng' => floatval($mountain['lng']),
            'description' => isset($mountain['fcodeName']) ? $mountain['fcodeName'] : 'Mountain Peak',
            'elevation' => isset($mountain['elevation']) ? $mountain['elevation'] . 'm' : 'Unknown elevation',
            'country' => isset($mountain['countryName']) ? $mountain['countryName'] : ''
        ];
    }
}

$output['status']['code'] = "200";
$output['status']['name'] = "ok";
$output['status']['description'] = "success";
$output['status']['returnedIn'] = intval((microtime(true) - $executionStartTime) * 1000) . " ms";
$output['data'] = $mountains;

header('Content-Type: application/json; charset=UTF-8');
echo json_encode($output);