@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
    {{ Form::open(array('id' => 'newGameForm', 'url' => '/new/game', 'method' => 'POST')) }}
    
        {{ Form::submit('New Game') }}
    
    {{ Form::close() }}
    
@stop


@section('content')

    <div class="gameList"></div>
    
@stop


@section('scripts')
    <script type="text/javascript" src='{{ asset('scripts/lobby.js') }}'></script>
@stop