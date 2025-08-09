<?php
// Allow requests from your React app
header("Access-Control-Allow-Origin: *");
header("Content-Type: text/plain");
header("Access-Control-Allow-Headers: Content-Type");

// Get the JSON body
$data = json_decode(file_get_contents("php://input"), true);

// Check if required fields exist
if (!isset($data['name']) || !isset($data['email']) || !isset($data['message'])) {
    echo "Invalid form data";
    exit;
}

$to = "smilyboy2207@gmail.com"; // Change to your email
$subject = "New Music Lesson Inquiry";

$message = "Full Name: " . $data['name'] . "\n";
$message .= "Email: " . $data['email'] . "\n";
$message .= "Phone: " . $data['phone'] . "\n";
$message .= "Age Range: " . $data['age'] . "\n";
$message .= "Experience Level: " . $data['experience'] . "\n";
$message .= "Musical Goals:\n" . $data['message'] . "\n";

$headers = "From: " . $data['email'];

// Send email
if (mail($to, $subject, $message, $headers)) {
    echo "✅ Message sent successfully!";
} else {
    echo "❌ Failed to send message.";
}
?>
