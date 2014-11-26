@extends ('_master')


@section('head')
    
@stop


@section('content')
    
    <p>login</p>
        
    {{ Form::open(array('id' => 'signupForm', 'url' => '/signup', 'method' => 'POST')) }}
        
        {{ Form::label('username', 'Username') }}
        {{ Form::text('username', '', array('id' => 'username')) }}
        
        {{ Form::label('email', 'Email') }}
        {{ Form::email('email', '', array('id' => 'email')) }}
        
        {{ Form::label('confirmEmail', 'Confirm Email') }}
        {{ Form::text('confirmEmail', '', array('id' => 'confirmEmail')) }}
        
        {{ Form::label('password', 'Password') }}
        {{ Form::password('password', array('id' => 'password')) }}
        
        {{ Form::submit('Submit') }}
        
    {{ Form::close() }}
    
@stop


@section('scripts')

@stop