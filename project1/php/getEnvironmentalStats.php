<?php
$countryCode = $_GET['country'];

$indicators = [
    'AG.LND.FRST.ZS', // Forest area (% of land area)
    'EN.ATM.CO2E.PC', // CO2 emissions (metric tons per capita)
    'EG.FEC.RNEW.ZS'  // Renewable energy consumption (% of total final energy consumption)
];

$data = [];
foreach ($indicators as $indicator) {
    $curl = curl_init();
    curl_setopt_array($curl, [
        CURLOPT_URL => "https://api.worldbank.org/v2/country/{$countryCode}/indicator/{$indicator}?format=json&date=2020",
        CURLOPT_RETURNTRANSFER => true,
    ]);
    $response = curl_exec($curl);
    $err = curl_error($curl);
    curl_close($curl);
    
    if (!$err) {
        $result = json_decode($response, true);
        $data[$indicator] = $result[1][0]['value'] ?? null;
    }
}

echo json_encode([
    'forestArea' => $data['AG.LND.FRST.ZS'],
    'co2Emissions' => $data['EN.ATM.CO2E.PC'],
    'renewableEnergy' => $data['EG.FEC.RNEW.ZS']
]);
