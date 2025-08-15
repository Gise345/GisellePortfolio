<?php
$lat = $_GET['lat'];
$lng = $_GET['lng'];
$apiKey = 'cf2bc77cf359d910ebb5f7fcdd756b04';

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lng}&appid={$apiKey}&units=metric",
    CURLOPT_RETURNTRANSFER => true,
]);

$response = curl_exec($curl);
$err = curl_error($curl);
curl_close($curl);

if ($err) {
    echo json_encode(['error' => $err]);
} else {
    $data = json_decode($response, true);
    $forecast = array_slice($data['list'], 0, 5);
    $result = [
        'city' => $data['city']['name'] . ', ' . $data['city']['country'], // Combine city and country here
        'temperature' => $forecast[0]['main']['temp'],
        'condition' => [
            'description' => $forecast[0]['weather'][0]['description'],
            'icon' => $forecast[0]['weather'][0]['icon']
        ],
        'forecast' => array_map(function($day) {
            return [
                'date' => date('Y-m-d', strtotime($day['dt_txt'])), // Use dt_txt for more accurate date
                'temp' => $day['main']['temp'],
                'condition' => $day['weather'][0]['description'],
                'icon' => $day['weather'][0]['icon']
            ];
        }, $forecast)
    ];
    echo json_encode($result);
}