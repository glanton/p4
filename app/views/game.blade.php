@extends ('_master')


@section('head')
    <script type="text/javascript" src="https://cdn.socket.io/socket.io-1.2.0.js"></script>
@stop


@section('controls')
    
    
    <!-- only for testing purposes -->
    {{ Form::open(array('id' => 'resetGame', 'url' => '/reset/game', 'method' => 'POST')) }}
        
        {{ Form::submit('Reset Game') }}
        
    {{ Form::close() }}
    
    
@stop


@section('content')
    
    <div id="gameSpace">
        <canvas id="particleCanvas"></canvas>
        <canvas id="spriteCanvas"></canvas>
    </div>
    
@stop


@section('inputs')
    
    <input type="hidden" name="userAuthkey" id="userAuthkey" value="{{ Auth::user()->authkey; }}">
    <input type="hidden" name="gameAuthkey" id="gameAuthkey" value="{{ Auth::user()->current_game_authkey; }}">

@stop


@section('scripts')
    <script type="text/javascript" src='{{ asset('scripts/client.js') }}'></script>
@stop