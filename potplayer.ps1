$path=$args[0]
$path=$path -replace "potplayer://" , ""
$path=$path -replace "%20" , " "
echo $path
& "C:\\Program Files\\DAUM\\PotPlayer\\PotPlayerMini64.exe" $path