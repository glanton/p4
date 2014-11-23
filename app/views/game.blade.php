@extends ('_master')


@section('head')
    <script type="text/javascript" src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
@stop


@section('content')
    
    <canvas id="gameBoard"></canvas>
    
@stop


@section('scripts')
    <script type="text/javascript" src='{{ asset('scripts/client.js') }}'></script>
@stop