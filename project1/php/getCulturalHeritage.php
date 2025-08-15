<?php
ini_set('display_errors', 'On');
error_reporting(E_ALL);

$executionStartTime = microtime(true);

$countryCode = isset($_GET['country']) ? strtolower($_GET['country']) : '';
if (empty($countryCode)) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

$url = "https://whc.unesco.org/en/list/xml/?iso_code={$countryCode}";

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
    echo json_encode(['error' => $err]);
} else {
    $xml = simplexml_load_string($response);
    if ($xml === false) {
        echo json_encode(['error' => 'Failed to parse XML']);
    } else {
        $sites = [];
        foreach ($xml->row as $row) {
            // Check if the site belongs to the selected country
            if (strtolower((string)$row->iso_code) === $countryCode) {
                $sites[] = [
                    'name' => (string)$row->site,
                    'type' => (string)$row->category,
                    'description' => (string)$row->short_description
                ];
            }
        }
        echo json_encode(['sites' => $sites]);
    }
}