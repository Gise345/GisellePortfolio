<?php
$countryCode = $_GET['country'];
$apiKey = 'YOUR_RESTCOUNTRIES_API_KEY';

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://restcountries.com/v3.1/alpha/{$countryCode}",
    CURLOPT_RETURNTRANSFER => true,
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => $err]);
} else {
    $data = json_decode($response, true)[0];
    $facts = [
        "The capital is {$data['capital'][0]}.",
        "The country has a population of {$data['population']} people.",
        "The official language(s) include " . implode(', ', array_values($data['languages'])) . ".",
        "The country is located in {$data['region']}, {$data['subregion']}.",
        "The country's area is {$data['area']} square kilometers."
    ];
    echo json_encode(['name' => $data['name']['common'], 'facts' => $facts]);
}
