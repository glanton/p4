<!DOCTYPE html>
<html>
<head>

    <title>Tayak</title>

    <meta charset='utf-8'>
    <link rel='stylesheet' href='{{ asset('css/p4.css') }}'>

    @yield('head')

</head>
<body>
    
    <div id="wrap">
    <div id="main">
    
    <div id="header">
        <div id="logo">Tayak</div>
        <div id="nav">Profile &nbsp;&nbsp;&nbsp; Controls</div>
    </div>
        
    <div id="content">
        @yield('content')
    </div>
      
    </div>  
    </div>
    
    
    <div id="footer">
        <div id="footerText">
            Alex Friberg | <a href="http://p1.alexf.me/">dwa15 portfolio</a>
        </div>
    </div>

    
    <!-- scripts: jQuery from Google and local script for switching forms -->
    <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js' type='text/javascript'></script>

    @yield('scripts')

</body>
</html>