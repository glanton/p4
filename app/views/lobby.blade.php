@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
    {{ Form::open(array('id' => 'newGameForm', 'url' => '/new/game', 'method' => 'POST')) }}
    
        {{ Form::submit('New Game') }}
    
    {{ Form::close() }}
    
@stop


@section('content')
    
    <p>lobby</p>
    
@stop


@section('scripts')

@stop