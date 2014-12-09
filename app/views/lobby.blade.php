@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
    @if (Auth::user()->current_game_authkey == 'not_in_game')
        {{ Form::open(array('id' => 'newGameForm', 'url' => '/new/game', 'method' => 'POST')) }}
        
            {{ Form::submit('New Game') }}
        
        {{ Form::close() }}
    @endif

@stop


@section('content')

    <div class="gameList"></div>
    
@stop


@section('scripts')
    
    <script type="text/javascript" src='{{ asset('scripts/lobby.js') }}'></script>
    <script type="text/javascript" src='{{ asset('scripts/gamestatus.js') }}'></script>
    
@stop