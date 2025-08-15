<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

header('Content-Type: application/json');

$executionStartTime = microtime(true);

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, "https://openexchangerates.org/api/latest.json?app_id=2428aa925100450088d9950968c8eec9");

$result = curl_exec($ch);

if (curl_errno($ch)) {
    $output['status']['code'] = "500";
    $output['status']['name'] = "error";
    $output['status']['description'] = curl_error($ch);
} else {
    $decoded = json_decode($result, true);
    
    if ($decoded) {
        $output['status']['code'] = "200";
        $output['status']['name'] = "ok";
        $output['data'] = $decoded;
    } else {
        $output['status']['code'] = "400";
        $output['status']['name'] = "error";
        $output['status']['description'] = "Failed to decode API response";
    }
}

curl_close($ch);

$output['status']['returnedIn'] = (microtime(true) - $executionStartTime) * 1000 . " ms";
echo json_encode($output);