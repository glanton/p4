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
    
    <div class="login">
    
        <div class="loginHead">login</div>
            
        {{ Form::open(array('id' => 'loginForm', 'url' => '/login', 'method' => 'POST')) }}
        
            {{ Form::email('loginEmail', '', array('id' => 'loginEmail', 'placeholder' => 'Email', 'required')) }}
            
            <br><br>
            
            {{ Form::password('loginPassword', array('id' => 'loginPassword', 'placeholder' => 'Password', 'required')) }}
            
            <br><br>
            
            {{ Form::submit('Submit') }}
        
        {{ Form::close() }}
        
        <br><br>
        
        <div class="loginHead">signup</div>
            
        {{ Form::open(array('id' => 'signupForm', 'url' => '/signup', 'method' => 'POST')) }}
            
            {{ Form::label('username', 'Username') }}
            <br>
            {{ Form::text('username', '', array('id' => 'username', 'required')) }}
            
            <br><br>
            
            {{ Form::label('email', 'Email') }}
            <br>
            {{ Form::email('email', '', array('id' => 'email', 'required')) }}
            
            <br><br>
            
            {{ Form::label('confirmEmail', 'Confirm Email') }}
            <br>
            {{ Form::email('confirmEmail', '', array('id' => 'confirmEmail', 'required')) }}
            
            <br><br>
            
            {{ Form::label('password', 'Password') }}
            <br>
            {{ Form::password('password', array('id' => 'password', 'required')) }}
            
            <br><br>
            
            {{ Form::label('confirmPassword', 'Confirm Password') }}
            <br>
            {{ Form::password('confirmPassword', array('id' => 'password', 'required')) }}
            
            <br><br>
            
            {{ Form::submit('Submit') }}
            
        {{ Form::close() }}
    
    </div>
    
@stop


@section('inputs')
    

@stop


@section('scripts')

@stop