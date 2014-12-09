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
        <div id="controls">
            @yield('controls')
        </div>
        <div id="nav">
            <!-- only display username and log out option if logged in -->
            @if (Auth::check())
                {{ Auth::user()->username; }}
                &nbsp;&nbsp;&nbsp;
                <a href='{{ url('/logout') }}'>Log out</a>
                &nbsp;&nbsp;&nbsp;
            @endif
            
            Controls
        </div>
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

    <input type="hidden" name="baseURL" id="baseURL" value="{{ url('/') }}">
    
    {{ Form::token() }}
    
    <!-- scripts: jQuery from Google and local script for switching forms -->
    <script src='https://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js' type='text/javascript'></script>
    <!--<script type="text/javascript" src='{{ asset('scripts/onclose.js') }}'></script>-->

    @yield('scripts')

</body>
</html>