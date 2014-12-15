@extends ('_master')


@section('head')
    
@stop


@section('controls')
    
@stop


@section('content')
    
    <ul>
        @foreach($errors->all() as $message)
            <li>{{ $message }}</li>
        @endforeach
        
        @if (Session::get('loginError'))
            <li>{{ Session::get('loginError') }}</li>
        @endif
    </ul>
        
    <p>login</p>
        
    {{ Form::open(array('id' => 'loginForm', 'url' => '/login', 'method' => 'POST')) }}
    
        {{ Form::email('loginEmail', '', array('id' => 'loginEmail', 'placeholder' => 'Email', 'required')) }}
        
        {{ Form::password('loginPassword', array('id' => 'loginPassword', 'placeholder' => 'Password', 'required')) }}
        
        {{ Form::submit('Submit') }}
    
    {{ Form::close() }}
    
    
    <p>signup</p>
        
    {{ Form::open(array('id' => 'signupForm', 'url' => '/signup', 'method' => 'POST')) }}
        
        {{ Form::label('username', 'Username') }}
        {{ Form::text('username', '', array('id' => 'username', 'required')) }}
        
        {{ Form::label('email', 'Email') }}
        {{ Form::email('email', '', array('id' => 'email', 'required')) }}
        
        {{ Form::label('confirmEmail', 'Confirm Email') }}
        {{ Form::email('confirmEmail', '', array('id' => 'confirmEmail', 'required')) }}
        
        {{ Form::label('password', 'Password') }}
        {{ Form::password('password', array('id' => 'password', 'required')) }}
        
        {{ Form::label('confirmPassword', 'Confirm Password') }}
        {{ Form::password('confirmPassword', array('id' => 'password', 'required')) }}
        
        {{ Form::submit('Submit') }}
        
    {{ Form::close() }}
    
@stop


@section('inputs')
    

@stop


@section('scripts')

@stop