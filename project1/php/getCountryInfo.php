<?php
$countryCode = $_GET['country'];
$url = "https://restcountries.com/v3.1/alpha/{$countryCode}";

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

$data = json_decode($response, true)[0];

// Get the first currency (if any exist)
$currencies = $data['currencies'] ?? [];
$firstCurrency = reset($currencies);
$currencyCode = key($currencies);

$result = [
    'name' => $data['name']['common'],
    'capital' => [
        'name' => $data['capital'][0],
        'lat' => $data['capitalInfo']['latlng'][0],
        'lng' => $data['capitalInfo']['latlng'][1],
    ],
    'continent' => $data['continents'][0],
    'languages' => implode(', ', $data['languages']),
    'currency' => [
        'name' => reset($data['currencies'])['name'],
        'code' => key($data['currencies']),
        'symbol' => reset($data['currencies'])['symbol']
    ],
    'isoAlpha2' => $data['cca2'],
    'population' => $data['population'],
    'area' => $data['area'],
];

echo json_encode($result);
