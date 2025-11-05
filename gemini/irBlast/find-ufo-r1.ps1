# PowerShell script to help find UFO-R1 device on network
Write-Host "Searching for UFO-R1 WiFi IR Blaster on your network..." -ForegroundColor Cyan

# Get your current network subnet
$localIP = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {$_.InterfaceAlias -notlike "*Loopback*" -and $_.IPAddress -notlike "169.254.*"} | Select-Object -First 1).IPAddress
$subnet = $localIP -replace '\.\d+$', ''

Write-Host "Scanning subnet: $subnet.0/24" -ForegroundColor Yellow

# Common ports for Tuya/Smart Life devices
$ports = @(80, 6668, 6667, 8080, 1883)

Write-Host "Checking common Smart Life device ports..." -ForegroundColor Green

# Quick scan of common IPs (limited range for speed)
$foundDeviceResults = foreach ($hostNumber in 1..254) {
    $ip = "$subnet.$hostNumber"
    $tcpClient = New-Object System.Net.Sockets.TcpClient
    $tcpClient.ReceiveTimeout = 100
    $tcpClient.SendTimeout = 100
    
    foreach ($port in $ports) {
        try {
            $result = $tcpClient.BeginConnect($ip, $port, $null, $null)
            $success = $result.AsyncWaitHandle.WaitOne(100)
            if ($success) {
                $tcpClient.EndConnect($result)
                Write-Host "Found device at: $ip`:$port" -ForegroundColor Green
                "$ip`:$port"
            }
        } catch {
            # Silent fail - device not responding on this port
        }
    }
    $tcpClient.Close()
}

$foundDevices = $foundDeviceResults | Where-Object { $_ } | Sort-Object -Unique

Write-Host "`nAlternative method - Check your router:" -ForegroundColor Cyan
Write-Host "1. Log into your router admin panel (usually http://192.168.1.1 or http://192.168.0.1)"
Write-Host "2. Look for 'Connected Devices' or 'DHCP Client List'"
Write-Host "3. Find device named 'UFO-R1', 'Smart IR', or with MAC starting with 'DC:4F:22' (Espressif)"

Write-Host "`nUsing ARP cache to find recent connections:" -ForegroundColor Yellow
arp -a | Select-String "dynamic" | ForEach-Object {
    $line = $_.Line
    if ($line -match '(\d+\.\d+\.\d+\.\d+).*?([\da-f]{2}-[\da-f]{2}-[\da-f]{2})') {
        $ip = $matches[1]
        $mac = $matches[2]
        # Check for known IoT device MAC prefixes
        if ($mac -match '^(dc-4f-22|84-0d-8e|d8-f1-5b|7c-f6-66|bc-dd-c2)') {
            Write-Host "Possible Smart Device: $ip (MAC: $mac)" -ForegroundColor Green
        }
    }
}

Write-Host "`nTo test if it's your UFO-R1:" -ForegroundColor Cyan
Write-Host "Try opening these URLs in your browser:"
if ($foundDevices.Count -gt 0) {
    foreach ($device in $foundDevices) {
        $ip = $device.Split(':')[0]
        Write-Host "  http://$ip" -ForegroundColor White
    }
} else {
    Write-Host "  http://$subnet.100" -ForegroundColor White
    Write-Host "  http://$subnet.101" -ForegroundColor White
    Write-Host "  http://$subnet.102" -ForegroundColor White
}

Write-Host "`nOnce you find the IP, enter it in the IR Blaster app!" -ForegroundColor Yellow
