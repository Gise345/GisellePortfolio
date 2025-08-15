<?php
header('Content-Type: application/json');

$countryCode = $_GET['country'] ?? '';

if (empty($countryCode)) {
    echo json_encode(['error' => 'Country code is required']);
    exit;
}

// Get country name from the existing countryBorders.geo.json file
$countryBordersFile = 'countryBorders.geo.json';
$jsonData = file_get_contents($countryBordersFile);
$data = json_decode($jsonData, true);

$countryName = '';
foreach ($data['features'] as $feature) {
    if ($feature['properties']['iso_a2'] === $countryCode) {
        $countryName = $feature['properties']['name'];
        break;
    }
}

if (empty($countryName)) {
    echo json_encode(['error' => 'Country not found']);
    exit;
}

$apiKey = 'e56d4e1801bd7637fae42424d1c8ab49';
// Use country name in the search query
$url = "https://gnews.io/api/v4/search?q=" . urlencode($countryName) . "&lang=en&max=4&token={$apiKey}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_URL, $url);
$result = curl_exec($ch);

if ($result === false) {
    echo json_encode(['error' => 'CURL error: ' . curl_error($ch)]);
    exit;
}

curl_close($ch);
$decode = json_decode($result, true);

if (isset($decode['articles'])) {
    // Filter articles to ensure they're relevant to the country
    $filteredArticles = array_filter($decode['articles'], function($article) use ($countryName) {
        return (
            stripos($article['title'], $countryName) !== false ||
            stripos($article['description'], $countryName) !== false
        );
    });
    
    // If no articles found after filtering, return all articles
    if (empty($filteredArticles)) {
        echo json_encode($decode['articles']);
    } else {
        echo json_encode(array_values($filteredArticles));
    }
} else {
    echo json_encode(['error' => 'Failed to fetch news']);
}